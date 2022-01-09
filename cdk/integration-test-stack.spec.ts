import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { getTable } from './dynamodb';
import { getEventBus } from './eventbridge';
import { IntegrationTestStack } from './integration-test-stack';
import { getFunctions } from './lambda';
import { getStateMachine } from './stepfunctions';

describe('Integration Test Stack', () => {
  test('returns a custom resource', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', { env: { account: '123456789', region: 'us-east-1' } });
    const fns = getFunctions(stack);
    new IntegrationTestStack(stack, 'IntegrationTestStack', {
      eventBus: getEventBus(stack, fns, getStateMachine(stack, fns)),
      table: getTable(stack),
    });
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
    template.resourceCountIs('AWS::Lambda::Function', 12);
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 2);
  });
});
