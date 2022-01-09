import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

import type { Payment } from '../models/payment';

const powerToolsConfig = { namespace: 'payments', serviceName: 'paymentCollections' };
const logger = new Logger(powerToolsConfig);
const metrics = new Metrics(powerToolsConfig);
const tracer = new Tracer(powerToolsConfig);

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @tracer.captureLambdaHandler()
  public async handler(
    input: { Payload: { Payment: Payment } },
    _context: Context,
  ): Promise<{ Status: number; Payment: Payment }> {
    const min = 0;
    const max = 1;
    const Status = Math.floor(Math.random() * (max - min + 1)) + min;
    logger.info(`Collection Status ${Status}`);

    return { Status, Payment: input.Payload.Payment };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
