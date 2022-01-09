import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { CloudFormationCustomResourceEvent } from 'aws-lambda';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

const powerToolsConfig = { namespace: 'payments', serviceName: 'paymentCollections' };
const logger = new Logger(powerToolsConfig);
const metrics = new Metrics(powerToolsConfig);
const tracer = new Tracer(powerToolsConfig);

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  @metrics.logMetrics({ captureColdStartMetric: true })
  @tracer.captureLambdaHandler()
  public async handler(
    event: CloudFormationCustomResourceEvent,
    _context: Context,
  ): Promise<{ Data?: { Result: string }; IsComplete: boolean }> {
    if (event.RequestType === 'Delete') {
      return { IsComplete: true };
    }
    const { Version } = event.ResourceProperties;
    try {
      // Query the DynamoDB table to get the meta record. If it has some processed records
      // and the processed count is equal to validated count, the test passes.
      const successResponse = (await PaymentEntity.get({ id: `TEST#${Version}#success` })).Item || {};
      const failureResponse = (await PaymentEntity.get({ id: `TEST#${Version}#failure` })).Item || {};
      logger.info(`Success Response: ${successResponse.status}`);
      logger.info(`Failure Response: ${failureResponse.status}`);
      const IsComplete =
        successResponse.status === PaymentStatus.SUCCESS &&
        [PaymentStatus.COLLECTION_FAILURE, PaymentStatus.COLLECTION_SUCCESS].includes(failureResponse.status);
      if (IsComplete) {
        metrics.addMetric('testPollComplete', MetricUnits.Count, 1);
      }
      {
        metrics.addMetric('testPollIncomplete', MetricUnits.Count, 1);
      }
      return IsComplete
        ? {
            Data: {
              Result: `Payment ${Version}-success finished with status ${successResponse.status} and payment ${Version}-failure finished with status ${failureResponse.status}`,
            },
            IsComplete,
          }
        : { IsComplete };
    } catch (e) {
      logger.error('Integration Test Error', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
