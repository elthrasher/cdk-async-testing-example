import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { captureAWSClient } from 'aws-xray-sdk-core';
import { Entity, Table } from 'dynamodb-toolbox';

const client = new DocumentClient();
captureAWSClient((client as DocumentClient & { service: DynamoDB }).service);

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  COLLECTIONS = 'COLLECTIONS',
  COLLECTION_FAILURE = 'COLLECTION_FAILURE',
  COLLECTION_SUCCESS = 'COLLECTION_SUCCESS',
}

export interface Payment {
  id: string;
  status: PaymentStatus;
  /*
   * Also:
   * amount
   * account
   * item
   * lots of stuff not relevant to the example
   */
}

<<<<<<< HEAD
type CustomKey = {
  id: string;
};

const table = new Table({ name: 'payments', partitionKey: 'pk', DocumentClient: new DocumentClient() });
=======
const table = new Table({
  name: 'payments',
  partitionKey: 'pk',
  DocumentClient: client,
});
>>>>>>> 9804cfa (Logger)

export const PaymentEntity = new Entity<Payment, CustomKey, typeof table>({
  name: 'payment',
  attributes: {
    id: { partitionKey: true },
    status: { type: 'string' },
  },
  table,
} as const);
