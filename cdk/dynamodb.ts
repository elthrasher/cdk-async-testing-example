import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';

export const getTable = (stack: Stack): Table => {
  return new Table(stack, 'PaymentsTable', {
    partitionKey: { name: 'pk', type: AttributeType.STRING },
    removalPolicy: RemovalPolicy.DESTROY,
    tableName: 'payments',
  });
};
