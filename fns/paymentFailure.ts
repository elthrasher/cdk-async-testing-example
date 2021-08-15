import { Payment, PaymentEntity, PaymentStatus } from '../models/payment';
import EventBridge from 'aws-sdk/clients/eventbridge';

const eb = new EventBridge();

import type { EventBridgeEvent } from 'aws-lambda';
export const handler = async (event: EventBridgeEvent<string, Payment>): Promise<void> => {
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
};
