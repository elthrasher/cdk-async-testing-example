import { Tracer } from '@aws-lambda-powertools/tracer';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

import type { Payment } from '../models/payment';

const tracer = new Tracer({ serviceName: 'paymentCollections' });

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(
    input: { Payload: { Payment: Payment } },
    _context: Context,
  ): Promise<{ Status: number; Payment: Payment }> {
    const min = 0;
    const max = 1;
    const Status = Math.floor(Math.random() * (max - min + 1)) + min;

    return { Status, Payment: input.Payload.Payment };
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
