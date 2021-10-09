import { CloudFormationCustomResourceEvent } from 'aws-lambda';

import { PaymentEntity, PaymentStatus } from '../models/payment';

export const handler = async (
  event: CloudFormationCustomResourceEvent,
): Promise<{ Data?: { Result: string }; IsComplete: boolean }> => {
  if (event.RequestType === 'Delete') {
    return { IsComplete: true };
  }
  const { Version } = event.ResourceProperties;
  try {
    // Query the DynamoDB table to get the meta record. If it has some processed records
    // and the processed count is equal to validated count, the test passes.
    const successResponse = (await PaymentEntity.get({ id: `TEST#${Version}#success` })).Item || {};
    const failureResponse = (await PaymentEntity.get({ id: `TEST#${Version}#failure` })).Item || {};
    console.log('Success Response: ', successResponse.status);
    console.log('Failure Response: ', failureResponse.status);
    const IsComplete =
      successResponse.status === PaymentStatus.SUCCESS &&
      [PaymentStatus.COLLECTION_FAILURE, PaymentStatus.COLLECTION_SUCCESS].includes(failureResponse.status);
    return IsComplete
      ? {
          Data: {
            Result: `Payment ${Version}-success finished with status ${successResponse.status} and payment ${Version}-failure finished with status ${failureResponse.status}`,
          },
          IsComplete,
        }
      : { IsComplete };
  } catch (e) {
    console.error(e);
    throw e;
  }
};
