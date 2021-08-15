import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';

import { AppStack } from './app-stack';

describe('App Stack', () => {
  test('create the app stack', () => {
    const app = new App();
    const stack = new Stack(app);
    new AppStack(stack, 'TestStack');
    const cfn = SynthUtils.toCloudFormation(stack);
    const resources = cfn.Resources;
    const matchObject: { Parameters: Record<string, unknown>; Resources: Record<string, unknown> } = {
      Parameters: expect.any(Object),
      Resources: {},
    };
    Object.keys(resources).forEach((res) => {
      switch (resources[res].Type) {
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
    expect(stack).toCountResources('AWS::DynamoDB::Table', 1);
    expect(stack).toCountResources('AWS::Events::EventBus', 1);
    expect(stack).toCountResources('AWS::Lambda::Function', 6);
    expect(stack).toCountResources('AWS::StepFunctions::StateMachine', 1);
  });
});
