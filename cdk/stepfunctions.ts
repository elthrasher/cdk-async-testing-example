import { Chain, Choice, Condition, StateMachine } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { Stack } from '@aws-cdk/core';

import { lambdaFunctions } from './lambda';

export const getStateMachine = (stack: Stack, fns: lambdaFunctions): StateMachine => {
  const openCollection = new LambdaInvoke(stack, 'OpenCollection', { lambdaFunction: fns.openCollection });
  const collect = new LambdaInvoke(stack, 'Collect', { lambdaFunction: fns.collect });
  const collectionFailure = new LambdaInvoke(stack, 'CollectionFailure', { lambdaFunction: fns.collectionFailure });
  const collectionSuccess = new LambdaInvoke(stack, 'CollectionSuccess', { lambdaFunction: fns.collectionSuccess });

  const isSuccessful = new Choice(stack, 'Is Collection Successful?');

  const chain = Chain.start(openCollection)
    // .next(new Wait(stack, 'WaitAround', { time: WaitTime.duration(Duration.seconds(30)) }))
    .next(collect)
    .next(
      isSuccessful
        .when(Condition.numberEquals('$.Payload.Status', 0), collectionSuccess)
        .when(Condition.numberEquals('$.Payload.Status', 1), collectionFailure),
    );

  return new StateMachine(stack, 'StateMachine', {
    definition: chain,
    stateMachineName: 'CollectionsStateMachine',
  });
};
