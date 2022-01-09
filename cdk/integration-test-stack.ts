import { CustomResource, Duration, NestedStack, NestedStackProps, Stack } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus } from 'aws-cdk-lib/aws-events';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';

interface IntegrationTestStackProps extends NestedStackProps {
  eventBus: EventBus;
  table: Table;
}

export class IntegrationTestStack extends NestedStack {
  testResource: CustomResource;
  constructor(stack: Stack, id: string, props: IntegrationTestStackProps) {
    super(stack, id, props);

    const { eventBus, table } = props;

    const lambdaProps = {
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      },
      environment: { NODE_OPTIONS: '--enable-source-maps' },
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.minutes(1),
      tracing: Tracing.ACTIVE,
    };

    const onEventHandler = new NodejsFunction(stack, 'IntTestEvent', {
      ...lambdaProps,
      entry: `${__dirname}/../fns/intTestEvent.ts`,
      environment: { BUS_NAME: eventBus.eventBusName },
      functionName: 'IntTestEvent',
    });

    eventBus.grantPutEventsTo(onEventHandler);

    const isCompleteHandler = new NodejsFunction(stack, 'IntTestIsComplete', {
      ...lambdaProps,
      entry: `${__dirname}/../fns/intTestIsComplete.ts`,
      functionName: 'IntTestIsComplete',
    });

    isCompleteHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ['dynamodb:GetItem'],
        conditions: {
          'ForAllValues:StringLike': {
            'dynamodb:LeadingKeys': ['TEST#*'],
          },
        },
        resources: [table.tableArn],
      }),
    );

    const intTestProvider = new Provider(stack, 'IntTestProvider', {
      isCompleteHandler,
      logRetention: RetentionDays.ONE_DAY,
      onEventHandler,
      totalTimeout: Duration.minutes(1),
    });

    this.testResource = new CustomResource(stack, 'IntTestResource', {
      properties: { Version: new Date().getTime().toString() },
      serviceToken: intTestProvider.serviceToken,
    });
  }
}
