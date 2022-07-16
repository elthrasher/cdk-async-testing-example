import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Entity, Table } from 'dynamodb-toolbox';

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

type CustomKey = {
  id: string;
};

const table = new Table({ name: 'payments', partitionKey: 'pk', DocumentClient: new DocumentClient() });

export const PaymentEntity = new Entity<Payment, CustomKey, typeof table>({
  name: 'payment',
  attributes: {
    id: { partitionKey: true },
    status: { type: 'string' },
  },
  table,
} as const);
