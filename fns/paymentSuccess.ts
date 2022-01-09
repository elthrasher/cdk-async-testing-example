import { Tracer } from '@aws-lambda-powertools/tracer';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

import type { Payment } from '../models/payment';
import type { EventBridgeEvent } from 'aws-lambda';

const tracer = new Tracer({ serviceName: 'paymentCollections' });

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(event: EventBridgeEvent<string, Payment>, _context: Context): Promise<void> {
    try {
      await PaymentEntity.update({ id: event.detail.id, status: PaymentStatus.SUCCESS });
    } catch (e) {
      console.error('Failed to record successful payment', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
