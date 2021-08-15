import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';

import { getTable } from './dynamodb';

describe('DynamoDB', () => {
  test('returns a table', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    getTable(stack);
    const cfn = SynthUtils.toCloudFormation(stack);

    expect(cfn).toMatchSnapshot();
    expect(stack).toCountResources('AWS::DynamoDB::Table', 1);
  });
});
