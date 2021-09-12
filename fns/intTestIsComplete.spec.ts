import { CloudFormationCustomResourceEvent } from 'aws-lambda';

import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { putFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { PaymentStatus } from '../models/payment';
import { handler } from './intTestIsComplete';

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

describe('custom resource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  test('test is complete', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: { id: 1, status: PaymentStatus.SUCCESS } });
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: { id: 1, status: PaymentStatus.COLLECTION_SUCCESS } });
    const response = await handler(event);
    expect(response).toEqual({
      Data: {
        Result:
          'Payment 123-success finished with status SUCCESS and payment 123-failure finished with status COLLECTION_SUCCESS',
      },
      IsComplete: true,
    });
  });
  test('test is not complete', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: { id: 1, status: PaymentStatus.SUCCESS } });
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: { id: 1, status: PaymentStatus.COLLECTIONS } });
    const response = await handler(event);
    expect(response).toEqual({
      IsComplete: false,
    });
  });
  test('empty response from table', async () => {
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: undefined });
    awsSdkPromiseResponse.mockReturnValueOnce({ Item: undefined });
    const response = await handler(event);
    expect(response).toEqual({
      IsComplete: false,
    });
  });
  test('do nothing on a delete event', async () => {
    await handler({ ...event, PhysicalResourceId: '', RequestType: 'Delete' });
    expect(putFn).not.toHaveBeenCalled();
  });
  test('handle errors', async () => {
    expect.assertions(1);
    awsSdkPromiseResponse.mockRejectedValueOnce(new Error('ERROR!'));
    try {
      await handler(event);
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toBe('ERROR!');
      }
    }
  });
});
