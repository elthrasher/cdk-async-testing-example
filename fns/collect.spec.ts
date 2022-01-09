import { PaymentStatus } from '../models/payment';
import { handler } from './collect';

import type { Context } from 'aws-lambda';

describe('collect function', () => {
  test('return 1 or 0', async () => {
    const result = await handler(
      { Payload: { Payment: { id: '1', status: PaymentStatus.COLLECTIONS } } },
      {} as Context,
    );
    expect(result.Status === 0 || result.Status === 1).toBeTruthy();
  });
});
