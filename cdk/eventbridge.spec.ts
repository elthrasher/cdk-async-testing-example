import { SynthUtils } from '@aws-cdk/assert';
import { App, Stack } from '@aws-cdk/core';

import { getEventBus } from './eventbridge';
import { getFunctions } from './lambda';
import { getStateMachine } from './stepfunctions';

describe('EventBridge', () => {
  test('returns an event bus', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    const fns = getFunctions(stack);
    getEventBus(stack, fns, getStateMachine(stack, fns));
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
    expect(stack).toCountResources('AWS::Events::EventBus', 1);
    expect(stack).toCountResources('AWS::StepFunctions::StateMachine', 1);
  });
});
