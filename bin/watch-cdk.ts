#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaBasedStack } from '../stacks/lambda-based-stack';
import { StepFunctionBasedStack } from '../stacks/step-function-based-stack';

const app = new cdk.App();
new LambdaBasedStack(app, 'WatchCdkStack', {});
new StepFunctionBasedStack(app, 'WatchStepCdkStack', {});