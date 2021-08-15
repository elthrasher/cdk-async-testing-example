import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy, Stack } from '@aws-cdk/core';

export const getTable = (stack: Stack): Table => {
  return new Table(stack, 'PaymentsTable', {
    partitionKey: { name: 'pk', type: AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
    tableName: 'payments',
  });
};
