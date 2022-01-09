import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { updateFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { PaymentStatus } from '../models/payment';
import { handler } from './paymentSuccess';

import type { Context } from 'aws-lambda';

const event = {
  account: '',
  detail: { id: '1', status: PaymentStatus.PENDING },
  ['detail-type']: 'collections',
  id: '',
  region: 'us-east-1',
  resources: [],
  source: 'payments',
  time: '',
  version: '1',
};

describe('payment success', () => {
  test('update the DynamoDB table with a success response', async () => {
    await handler(event, {} as Context);
    expect(updateFn).toHaveBeenCalledWith({
      ExpressionAttributeNames: {
        '#_ct': '_ct',
        '#_et': '_et',
        '#_md': '_md',
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':_ct': expect.any(String),
        ':_et': 'payment',
        ':_md': expect.any(String),
        ':status': 'SUCCESS',
      },
      Key: {
        pk: '1',
      },
      TableName: 'payments',
      UpdateExpression:
        'SET #_ct = if_not_exists(#_ct,:_ct), #_md = :_md, #_et = if_not_exists(#_et,:_et), #status = :status',
    });
  });
  test('handle errors', async () => {
    expect.assertions(1);
    awsSdkPromiseResponse.mockRejectedValueOnce(new Error('ERROR!'));
    try {
      await handler(event, {} as Context);
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toBe('ERROR!');
      }
    }
  });
});
