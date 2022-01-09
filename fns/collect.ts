import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

import type { Payment } from '../models/payment';

// const powerToolsConfig = { serviceName: 'paymentCollections' };
// const logger = new Logger(powerToolsConfig);
// const tracer = new Tracer(powerToolsConfig);

class Lambda implements LambdaInterface {
  // @logger.injectLambdaContext()
  // @tracer.captureLambdaHandler()
  public async handler(
    input: { Payload: { Payment: Payment } },
    _context: Context,
  ): Promise<{ Status: number; Payment: Payment }> {
    const min = 0;
    const max = 1;
    const Status = Math.floor(Math.random() * (max - min + 1)) + min;
    console.info(`Collection Status ${Status}`);

    return { Status, Payment: input.Payload.Payment };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
