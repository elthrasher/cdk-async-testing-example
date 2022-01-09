import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';
import type { Payment } from '../models/payment';

class Lambda implements LambdaInterface {
  public async handler(input: { Payload: { Payment: Payment } }, _context: Context): Promise<void> {
    try {
      await PaymentEntity.update({ id: input.Payload.Payment.id, status: PaymentStatus.COLLECTION_SUCCESS });
    } catch (e) {
      console.error('Failed to record collection success', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
