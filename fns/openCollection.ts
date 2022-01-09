import { EventBridgeEvent } from 'aws-lambda';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';
import type { Payment } from '../models/payment';

class Lambda implements LambdaInterface {
  public async handler(event: EventBridgeEvent<string, Payment>, _context: Context): Promise<{ Payment: Payment }> {
    const payment = event.detail;
    await PaymentEntity.update({ id: payment.id, status: PaymentStatus.COLLECTIONS });
    console.info('Payment set to collection');

    return { Payment: { ...payment, status: PaymentStatus.COLLECTIONS } };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
