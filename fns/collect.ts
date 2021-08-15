import { Payment } from '../models/payment';

export const handler = async (input: {
  Payload: { Payment: Payment };
}): Promise<{ Status: number; Payment: Payment }> => {
  const min = 0;
  const max = 1;
  const Status = Math.floor(Math.random() * (max - min + 1)) + min;

  return { Status, Payment: input.Payload.Payment };
};
