import { Table } from '@aws-cdk/aws-dynamodb';
import { EventBus } from '@aws-cdk/aws-events';
import { NestedStack, NestedStackProps, Stack } from '@aws-cdk/core';
import { getTable } from './dynamodb';
import { getEventBus } from './eventbridge';
import { getFunctions } from './lambda';
import { getStateMachine } from './stepfunctions';

export class AppStack extends NestedStack {
  eventBus: EventBus;
  table: Table;
  constructor(stack: Stack, id: string, props?: NestedStackProps) {
    super(stack, id, props);

    this.table = getTable(stack);

    const fns = getFunctions(stack);

    this.table.grantWriteData(fns.collectionFailure);
    this.table.grantWriteData(fns.collectionSuccess);
    this.table.grantWriteData(fns.openCollection);
    this.table.grantWriteData(fns.paymentFailure);
    this.table.grantWriteData(fns.paymentSuccess);

    const sm = getStateMachine(stack, fns);
    this.eventBus = getEventBus(stack, fns, sm);
  }
}
