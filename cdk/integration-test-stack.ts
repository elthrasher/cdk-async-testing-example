import { Table } from '@aws-cdk/aws-dynamodb';
import { EventBus } from '@aws-cdk/aws-events';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { CustomResource, Duration, NestedStack, NestedStackProps, Stack } from '@aws-cdk/core';
import { Provider } from '@aws-cdk/custom-resources';

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
      },
      runtime: Runtime.NODEJS_14_X,
      timeout: Duration.minutes(1),
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

    table.grantReadData(isCompleteHandler);

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
