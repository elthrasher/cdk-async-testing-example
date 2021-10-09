import EventBridge from 'aws-sdk/clients/eventbridge';

import type { CloudFormationCustomResourceEvent } from 'aws-lambda';
const eb = new EventBridge();

export const handler = async (event: CloudFormationCustomResourceEvent): Promise<void> => {
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
    console.error(e);
    throw new Error('Integration Test failed!');
  }
};
