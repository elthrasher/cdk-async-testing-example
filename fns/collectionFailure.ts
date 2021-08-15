import { Payment, PaymentEntity, PaymentStatus } from '../models/payment';

export const handler = async (input: { Payload: { Payment: Payment } }): Promise<void> => {
  try {
    await PaymentEntity.update({ id: input.Payload.Payment.id, status: PaymentStatus.COLLECTION_FAILURE });
  } catch (e) {
    console.error('Failed to record collection failure', e);
    throw e;
  }
};
