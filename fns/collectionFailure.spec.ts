import { awsSdkPromiseResponse } from '../__mocks__/aws-sdk/clients/awsSdkPromiseResponse';
import { updateFn } from '../__mocks__/aws-sdk/clients/dynamodb';
import { PaymentStatus } from '../models/payment';
import { handler } from './collectionFailure';

describe('collection failure function', () => {
  test('update the DynamoDB table with a failure response', async () => {
    await handler({ Payload: { Payment: { id: '1', status: PaymentStatus.COLLECTIONS } } });
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
        ':status': 'COLLECTION_FAILURE',
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
      await handler({ Payload: { Payment: { id: '1', status: PaymentStatus.COLLECTIONS } } });
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toBe('ERROR!');
      }
    }
  });
});
