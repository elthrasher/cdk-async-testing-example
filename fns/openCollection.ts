import { Tracer } from '@aws-lambda-powertools/tracer';
import { EventBridgeEvent } from 'aws-lambda';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';
import type { Payment } from '../models/payment';

const tracer = new Tracer({ serviceName: 'paymentCollections' });

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(event: EventBridgeEvent<string, Payment>, _context: Context): Promise<{ Payment: Payment }> {
    const payment = event.detail;
    await PaymentEntity.update({ id: payment.id, status: PaymentStatus.COLLECTIONS });

    return { Payment: { ...payment, status: PaymentStatus.COLLECTIONS } };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
