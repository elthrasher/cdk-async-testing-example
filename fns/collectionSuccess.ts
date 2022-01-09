import { Tracer } from '@aws-lambda-powertools/tracer';

import { PaymentEntity, PaymentStatus } from '../models/payment';
import { Logger } from '@aws-lambda-powertools/logger';
import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';
import type { Payment } from '../models/payment';

const powerToolsConfig = { serviceName: 'paymentCollections' };
const logger = new Logger(powerToolsConfig);
const tracer = new Tracer(powerToolsConfig);

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  @tracer.captureLambdaHandler()
  public async handler(input: { Payload: { Payment: Payment } }, _context: Context): Promise<void> {
    try {
      await PaymentEntity.update({ id: input.Payload.Payment.id, status: PaymentStatus.COLLECTION_SUCCESS });
    } catch (e) {
      logger.error('Failed to record collection success', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
