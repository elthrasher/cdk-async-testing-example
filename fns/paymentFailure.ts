import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import EventBridge from 'aws-sdk/clients/eventbridge';

import { PaymentEntity, PaymentStatus } from '../models/payment';

import type { Payment } from '../models/payment';
import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { EventBridgeEvent, Context } from 'aws-lambda';

const powerToolsConfig = { namespace: 'payments', serviceName: 'paymentCollections' };
const logger = new Logger(powerToolsConfig);
const metrics = new Metrics(powerToolsConfig);
const tracer = new Tracer(powerToolsConfig);

const eb = tracer.captureAWSClient(new EventBridge());

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  @metrics.logMetrics({ captureColdStartMetric: true })
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
      metrics.addMetric('paymentFailure', MetricUnits.Count, 1);
    } catch (e) {
      logger.error('Failed to record failed payment (so much failure)', e);
      throw e;
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
