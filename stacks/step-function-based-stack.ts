import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';

import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as events from 'aws-cdk-lib/aws-events';

export class StepFunctionBasedStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
   
    const timeBucket = new s3.Bucket(this, 'time-step-bucket', {});

    //HttpInvoke Task only make authenticated requests, this creates some fake basic authcreds.
    var connection = new events.Connection(this, "fake-connection", {
      authorization :  events.Authorization.basic("user", cdk.SecretValue.unsafePlainText("password"))
    })


    var getTimeTask = new tasks.HttpInvoke(this, "getTime", {
      method : stepfunctions.TaskInput.fromText(tasks.HttpMethod.GET),
      apiRoot: "https://timeapi.io",
      queryStringParameters : stepfunctions.TaskInput.fromObject({
        timeZone : "Europe/London"
      }),
      apiEndpoint : stepfunctions.TaskInput.fromText("api/Time/current/zone"),
      connection : connection,
      outputPath : "$.ResponseBody"
    });

  
    var putInS3Task = new tasks.CallAwsService(this, "put-task", {
      service : "s3",
      action : "putObject",
      parameters : {
        "Body": {
          "london_datetime.$" : "$.dateTime"
        },
        "Bucket": timeBucket.bucketName,
        "Key.$": "$$.State.EnteredTime"
      },
      iamResources : [timeBucket.arnForObjects("*")]
    });


    var downloadAndSaveStateMachine = new stepfunctions.StateMachine(this, "step-process", {
      definitionBody : stepfunctions.DefinitionBody.fromChainable(getTimeTask.next(putInS3Task))
    });
 
    //Allow access to the bucket from the process
    timeBucket.grantPut(downloadAndSaveStateMachine);
    
    //Create a schedule
    const eventRule = new events.Rule(this, 'schedule', {
      schedule: events.Schedule.cron({ minute: '0' }),
      targets : [
        new targets.SfnStateMachine(downloadAndSaveStateMachine)
      ]
    });
  }
}
