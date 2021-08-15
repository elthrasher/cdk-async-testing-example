import { Payment, PaymentEntity, PaymentStatus } from '../models/payment';

import type { EventBridgeEvent } from 'aws-lambda';
export const handler = async (event: EventBridgeEvent<string, Payment>): Promise<void> => {
  try {
    await PaymentEntity.update({ id: event.detail.id, status: PaymentStatus.SUCCESS });
  } catch (e) {
    console.error('Failed to record successful payment', e);
    throw e;
  }
};
