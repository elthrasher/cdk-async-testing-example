import { App } from 'aws-cdk-lib';

import { PaymentsAppStack } from './payments-app-stack';

const app = new App();

new PaymentsAppStack(app, 'PaymentsAppStack', {
  description: 'Fake Payments App to demo async testing',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: 'payments-app-stack',
});
