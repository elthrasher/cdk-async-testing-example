import { Architecture, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Duration, Stack } from '@aws-cdk/core';

const functionNames = [
  'collect',
  'collectionFailure',
  'collectionSuccess',
  'openCollection',
  'paymentFailure',
  'paymentSuccess',
] as const;

export type lambdaFunctions = {
  [key in typeof functionNames[number]]: LambdaFunction;
};

const lambdaProps = {
  architectures: [Architecture.ARM_64],
  bundling: {
    externalModules: [],
  },
  runtime: Runtime.NODEJS_14_X,
  timeout: Duration.minutes(1),
};

export const getFunctions = (scope: Stack): lambdaFunctions => {
  return functionNames.reduce(
    (prev, fn) => ({
      ...prev,
      [fn]: new NodejsFunction(scope, `${fn}Function`, {
        ...lambdaProps,
        entry: `${__dirname}/../fns/${fn}.ts`,
        functionName: fn,
      }),
    }),
    {} as lambdaFunctions,
  );
};
