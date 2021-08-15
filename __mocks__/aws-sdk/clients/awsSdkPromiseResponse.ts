// See https://dev.to/elthrasher/mocking-aws-with-jest-and-typescript-199i
export const awsSdkPromiseResponse = jest.fn().mockReturnValue(Promise.resolve(true));
