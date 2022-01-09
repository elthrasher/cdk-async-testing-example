import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { PaymentsAppStack } from './payments-app-stack';

describe('Entire Stack', () => {
  test('create the entire stack', () => {
    const app = new App();
    const stack = new PaymentsAppStack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    const template = Template.fromStack(stack);
    const cfn = template.toJSON();
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
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.resourceCountIs('AWS::Events::EventBus', 1);
    template.resourceCountIs('AWS::Lambda::Function', 12);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 2);
  });
});
