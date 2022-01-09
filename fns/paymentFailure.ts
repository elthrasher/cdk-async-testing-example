import { Tracer } from '@aws-lambda-powertools/tracer';
import EventBridge from 'aws-sdk/clients/eventbridge';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { Payment } from '../models/payment';
import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { EventBridgeEvent, Context } from 'aws-lambda';

const tracer = new Tracer({ serviceName: 'paymentCollections' });

const eb = tracer.captureAWSClient(new EventBridge());

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(event: EventBridgeEvent<string, Payment>, _context: Context): Promise<void> {
    try {
      await PaymentEntity.update({ id: event.detail.id, status: PaymentStatus.FAILURE });
      await eb
        .putEvents({
          Entries: [
            {
              EventBusName: 'PaymentBus',
              Source: 'payments',
              DetailType: 'collections',
              Time: new Date(),
              Detail: JSON.stringify(event.detail),
            },
          ],
        })
        .promise();
    } catch (e) {
      console.error('Failed to record failed payment (so much failure)', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
