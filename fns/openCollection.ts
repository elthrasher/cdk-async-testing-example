import { EventBridgeEvent } from 'aws-lambda';

import { Payment, PaymentEntity, PaymentStatus } from '../models/payment';

export const handler = async (event: EventBridgeEvent<string, Payment>): Promise<{ Payment: Payment }> => {
  const payment = event.detail;
  await PaymentEntity.update({ id: payment.id, status: PaymentStatus.COLLECTIONS });

  return { Payment: { ...payment, status: PaymentStatus.COLLECTIONS } };
};
