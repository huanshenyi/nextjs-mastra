import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as timestream from "aws-cdk-lib/aws-timestream";
import * as iot from "aws-cdk-lib/aws-iot";

export class HumidityTemperatureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Timestream database and table
    const database = new timestream.CfnDatabase(this, "SensorDatabase", {
      databaseName: "esp32data",
    });

    const table = new timestream.CfnTable(this, "SensorTable", {
      databaseName: database.databaseName!,
      tableName: "temp_humid_table",
      retentionProperties: {
        memoryStoreRetentionPeriodInHours: "12",
        magneticStoreRetentionPeriodInDays: "10",
      },
      schema: {
        compositePartitionKey: [
          {
            type: "DIMENSION",
            name: "deviceid",
            enforcementInRecord: "REQUIRED",
          },
        ],
      },
    });
    table.addDependency(database);

    // Create IAM role for IoT to write to Timestream
    const timestreamWriteRole = new iam.Role(this, "TimestreamWriteRole", {
      assumedBy: new iam.ServicePrincipal("iot.amazonaws.com"),
    });

    timestreamWriteRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["timestream:WriteRecords", "timestream:DescribeEndpoints"],
        resources: [
          `arn:aws:timestream:${this.region}:${this.account}:database/${database.databaseName}/table/${table.tableName}`,
        ],
      })
    );

    // Create IoT Rule to route data to Timestream
    new iot.CfnTopicRule(this, "SendTempHumidToTimestreamRule", {
      ruleName: "sendTempHumidToTimestream",
      topicRulePayload: {
        sql: "SELECT temp as temperature, humid as humidity FROM 'esp32-thing/example/topic' WHERE status = '0'",
        awsIotSqlVersion: "2016-03-23",
        actions: [
          {
            timestream: {
              databaseName: database.databaseName!,
              tableName: table.tableName!,
              dimensions: [
                {
                  name: "deviceid",
                  value: "${topic(1)}",
                },
              ],
              roleArn: timestreamWriteRole.roleArn,
            },
          },
        ],
      },
    });

    // IoT ポリシーを作成 - 全てのアクションを許可する
    const iotPolicy = new iot.CfnPolicy(this, "IoTFullAccessPolicy", {
      policyName: "iot-full-access-policy",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "iot:*",
            Resource: "*",
          },
        ],
      },
    });

    // Output values
    new cdk.CfnOutput(this, "TimestreamDatabaseName", {
      value: database.databaseName!,
      description: "Timestream Database Name",
    });

    new cdk.CfnOutput(this, "TimestreamTableName", {
      value: table.tableName!,
      description: "Timestream Table Name",
    });

    new cdk.CfnOutput(this, "IoTPolicyName", {
      value: iotPolicy.policyName || "iot-full-access-policy",
      description: "IoT Policy Name",
    });

    new cdk.CfnOutput(this, "IoTPolicyArn", {
      value: `arn:aws:iot:${this.region}:${this.account}:policy/${
        iotPolicy.policyName || "iot-full-access-policy"
      }`,
      description: "IoT Policy ARN",
    });
  }
}
