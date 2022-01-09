import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { getFunctions } from './lambda';
import { getStateMachine } from './stepfunctions';

describe('Entire Stack', () => {
  test('returns lambda functions', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    const fns = getFunctions(stack);
    getStateMachine(stack, fns);
    const template = Template.fromStack(stack);
    const cfn = template.toJSON();
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
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });
});
