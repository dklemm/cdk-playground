#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WatchCdkStack } from '../lib/watch-cdk-stack';
import { WatchStepCdkStack } from '../lib/watch-cdk-step-stack';

const app = new cdk.App();
new WatchCdkStack(app, 'WatchCdkStack', {});
new WatchStepCdkStack(app, 'WatchStepCdkStack', {});