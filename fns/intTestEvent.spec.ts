import { CloudFormationCustomResourceEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { putEventsFn } from '../__mocks__/aws-sdk/clients/eventbridge';
import { handler } from './intTestEvent';

const event = {
  LogicalResourceId: '',
  RequestId: '',
  RequestType: 'Create',
  ResourceProperties: { ServiceToken: 'fake-token', Version: '123' },
  ResourceType: '',
  ResponseURL: '',
  ServiceToken: 'fake-token',
  StackId: '',
} as CloudFormationCustomResourceEvent;

describe('collection success function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  test('update the DynamoDB table with a success response', async () => {
    await handler(event);
    expect(putEventsFn).toHaveBeenCalledWith({
      Entries: [
        {
          Detail: '{"id":"123-success"}',
          DetailType: 'success',
          EventBusName: undefined,
          Source: 'payments',
          Time: expect.any(Date),
        },
      ],
    });
    expect(putEventsFn).toHaveBeenCalledWith({
      Entries: [
        {
          Detail: '{"id":"123-failure"}',
          DetailType: 'failure',
          EventBusName: undefined,
          Source: 'payments',
          Time: expect.any(Date),
        },
      ],
    });
  });
  test('do nothing on a delete event', async () => {
    await handler({ ...event, PhysicalResourceId: '', RequestType: 'Delete' });
    expect(putEventsFn).not.toHaveBeenCalled();
  });
  test('handle errors', async () => {
    expect.assertions(1);
    awsSdkPromiseResponse.mockRejectedValueOnce(new Error('ERROR!'));
    try {
      await handler(event);
    } catch (e) {
      expect(e.message).toBe('Integration Test failed!');
    }
  });
});
