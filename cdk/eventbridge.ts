import { EventBus, Rule } from '@aws-cdk/aws-events';
import { LambdaFunction, SfnStateMachine } from '@aws-cdk/aws-events-targets';
import { StateMachine } from '@aws-cdk/aws-stepfunctions';
import { Stack } from '@aws-cdk/core';
import { EventBridgeWebSocket } from 'cdk-eventbridge-socket';

import type { lambdaFunctions } from './lambda';

export const getEventBus = (stack: Stack, fns: lambdaFunctions, sm: StateMachine): EventBus => {
  const eventBus = new EventBus(stack, 'PaymentBus', {
    eventBusName: 'PaymentBus',
  });

  new Rule(stack, 'PaymentSuccessRule', {
    description: 'We got paid',
    eventBus,
    eventPattern: {
      detailType: ['success'],
      source: ['payments'],
    },
    targets: [new LambdaFunction(fns.paymentSuccess)],
  });

  new Rule(stack, 'PaymentFailureRule', {
    description: 'We did not get paid',
    eventBus,
    eventPattern: {
      detailType: ['failure'],
      source: ['payments'],
    },
    targets: [new LambdaFunction(fns.paymentFailure)],
  });

  new Rule(stack, 'CollectionsRule', {
    description: 'Need to call in Knuckles',
    eventBus,
    eventPattern: {
      detailType: ['collections'],
      source: ['payments'],
    },
    targets: [new SfnStateMachine(sm)],
  });

  eventBus.grantPutEventsTo(fns.paymentFailure);

  new EventBridgeWebSocket(stack, 'sockets', {
    bus: eventBus.eventBusName,
    eventPattern: {
      source: ['payments'],
    },
    stage: 'dev',
  });

  return eventBus;
};
