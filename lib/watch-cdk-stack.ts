import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';

export class WatchCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
   
    const timeBucket = new s3.Bucket(this, 'time-bucket', {});

    const downloadLambda = new lambda.Function(this, 'MyFunction', {
      environment : {
        TARGET_BUCKET : timeBucket.bucketName
      },
      timeout: cdk.Duration.seconds(30),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'download.handler',
      code: lambda.Code.fromAsset("lambda-src")
    });

    timeBucket.grantPut(downloadLambda);


    //Create a schedule
    const eventRule = new events.Rule(this, 'schedule', {
      schedule: events.Schedule.cron({ minute: '0' }),
      targets : [
        new targets.LambdaFunction(downloadLambda)
      ]
    });
  }
}
