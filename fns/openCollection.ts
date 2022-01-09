import { Logger } from '@aws-lambda-powertools/logger';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { EventBridgeEvent } from 'aws-lambda';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';
import type { Payment } from '../models/payment';
const powerToolsConfig = { serviceName: 'paymentCollections' };
const logger = new Logger(powerToolsConfig);
const tracer = new Tracer(powerToolsConfig);

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  @tracer.captureLambdaHandler()
  public async handler(event: EventBridgeEvent<string, Payment>, _context: Context): Promise<{ Payment: Payment }> {
    const payment = event.detail;
    await PaymentEntity.update({ id: payment.id, status: PaymentStatus.COLLECTIONS });
    logger.info('Payment set to collection');

    return { Payment: { ...payment, status: PaymentStatus.COLLECTIONS } };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
