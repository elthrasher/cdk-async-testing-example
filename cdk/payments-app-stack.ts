import { CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';

import { AppStack } from './app-stack';
import { IntegrationTestStack } from './integration-test-stack';

export class PaymentsAppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const appStack = new AppStack(this, 'AppStack');

    const intTestStack = new IntegrationTestStack(this, 'IntegrationTestStack', {
      eventBus: appStack.eventBus,
      table: appStack.table,
    });

    intTestStack.addDependency(appStack);

    new CfnOutput(this, 'IntTestResult', { value: intTestStack.testResource.getAttString('Result') });
  }
}
