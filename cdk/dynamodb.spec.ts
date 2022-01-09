import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { getTable } from './dynamodb';

describe('DynamoDB', () => {
  test('returns a table', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    getTable(stack);
    const template = Template.fromStack(stack);
    const cfn = template.toJSON();

    expect(cfn).toMatchSnapshot();
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });
});
