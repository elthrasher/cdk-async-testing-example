import { SynthUtils } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';

import { PaymentsAppStack } from './payments-app-stack';

describe('Entire Stack', () => {
  test('create the entire stack', () => {
    const app = new App();
    const stack = new PaymentsAppStack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    const cfn = SynthUtils.toCloudFormation(stack);
    const resources = cfn.Resources;
    const matchObject: { Parameters: Record<string, unknown>; Resources: Record<string, unknown> } = {
      Parameters: expect.any(Object),
      Resources: {},
    };
    Object.keys(resources).forEach((res) => {
      switch (resources[res].Type) {
        case 'AWS::CloudFormation::CustomResource':
          matchObject.Resources[res] = {
            Properties: { Version: expect.any(String) },
          };
          break;
        case 'AWS::Lambda::Function':
          matchObject.Resources[res] = {
            Properties: { Code: expect.any(Object) },
          };
          break;
        default:
          break;
      }
    });

    expect(cfn).toMatchSnapshot(matchObject);
    expect(stack).toCountResources('AWS::CloudFormation::CustomResource', 1);
    expect(stack).toCountResources('AWS::DynamoDB::Table', 2);
    expect(stack).toCountResources('AWS::Events::EventBus', 1);
    expect(stack).toCountResources('AWS::Lambda::Function', 15);
    expect(stack).toCountResources('AWS::StepFunctions::StateMachine', 2);
  });
});
