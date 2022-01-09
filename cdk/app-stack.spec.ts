import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { AppStack } from './app-stack';

describe('App Stack', () => {
  test('create the app stack', () => {
    const app = new App();
    const stack = new Stack(app);
    new AppStack(stack, 'TestStack');
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

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Lambda::Function', 6);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });
});
