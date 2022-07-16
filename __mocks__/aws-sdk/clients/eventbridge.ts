// See https://dev.to/elthrasher/mocking-aws-with-jest-and-typescript-199i
import { awsSdkPromiseResponse } from './awsSdkPromiseResponse';

export const putEventsFn = jest.fn().mockImplementation(() => ({ promise: awsSdkPromiseResponse }));

export default class EventBridge {
  customizeRequests = jest.fn();
  putEvents = putEventsFn;
}
