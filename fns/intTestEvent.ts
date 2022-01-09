import EventBridge from 'aws-sdk/clients/eventbridge';
import { captureAWSClient } from 'aws-xray-sdk-core';

import type { LambdaInterface } from '@aws-lambda-powertools/commons';
import type { Context } from 'aws-lambda';

import type { CloudFormationCustomResourceEvent } from 'aws-lambda';

const eb = captureAWSClient(new EventBridge());

class Lambda implements LambdaInterface {
  public async handler(event: CloudFormationCustomResourceEvent, _context: Context): Promise<void> {
    if (event.RequestType === 'Delete') {
      return;
    }
    try {
      const { Version } = event.ResourceProperties;

      const events = ['success', 'failure'].map((status) =>
        eb
          .putEvents({
            Entries: [
              {
                EventBusName: process.env.BUS_NAME,
                Source: 'payments',
                DetailType: status,
                Time: new Date(),
                Detail: JSON.stringify({ id: `TEST#${Version}#${status}` }),
              },
            ],
          })
          .promise(),
      );

      await Promise.all(events);
    } catch (e) {
      console.error('Integration Test failed!', e);
      throw new Error('Integration Test failed!');
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler;
