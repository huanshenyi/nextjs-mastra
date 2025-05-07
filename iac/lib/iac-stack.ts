import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface IacStackProps extends cdk.StackProps {
  repository: ecr.Repository;
  imageTag?: string; // 外部からタグを指定するためのオプションパラメータ
}

export class IacStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IacStackProps) {
    super(scope, id, props);

    // 外部から渡されたECRリポジトリを使用
    const repository = props.repository;

    // Secrets Managerでシークレットを作成
    const appSecret = new secretsmanager.Secret(this, "NextjsAppSecret", {
      secretName: "nextjs-mastra-secrets",
      description: "Secrets for Nextjs Mastra application",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          BASE_URL: "https://cloud.langfuse.com",
          REGION: "ap-northeast-1",
          PUBLICK_KEY: "your-public-key-value",
        }),
        generateStringKey: "SECRET_KEY",
      },
    });

    // VPCの作成
    const vpc = new ec2.Vpc(this, "NextjsMastraVpc", {
      maxAzs: 2,
      natGateways: 1,
    });

    // ECSクラスターの作成
    const cluster = new ecs.Cluster(this, "NextjsMastraCluster", {
      vpc,
      containerInsights: true,
      clusterName: "nextjs-mastra-cluster",
    });

    // タスク実行ロールの作成
    const executionRole = new iam.Role(this, "NextjsAppTaskExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AmazonECSTaskExecutionRolePolicy"
        ),
      ],
    });

    // シークレットへのアクセス権限を追加
    appSecret.grantRead(executionRole);

    // タスクロールの作成（コンテナが実行時に使用するロール）
    const taskRole = new iam.Role(this, "NextjsAppTaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
    });

    // Bedrockへのフルアクセスポリシーをタスクロールにアタッチする
    taskRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonBedrockFullAccess")
    );

    // タスク定義の作成（タスクロールを追加）
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "NextjsAppTaskDef",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
        executionRole,
        taskRole, // タスクロールを指定
      }
    );

    // コンテナの定義
    const container = taskDefinition.addContainer("NextjsAppContainer", {
      // 指定されたタグがある場合はそのタグを使用し、ない場合は最新のイメージを使用
      image: props.imageTag
        ? ecs.ContainerImage.fromEcrRepository(repository, props.imageTag)
        : ecs.ContainerImage.fromEcrRepository(repository),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "nextjs-app" }),
      secrets: {
        REGION: ecs.Secret.fromSecretsManager(appSecret, "REGION"),
        PUBLICK_KEY: ecs.Secret.fromSecretsManager(appSecret, "PUBLICK_KEY"),
        SECRET_KEY: ecs.Secret.fromSecretsManager(appSecret, "SECRET_KEY"),
        BASE_URL: ecs.Secret.fromSecretsManager(appSecret, "BASE_URL"),
      },
      environment: {
        NODE_ENV: "production",
      },
    });

    // コンテナのポートマッピング
    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // ECSサービスの作成
    const service = new ecs.FargateService(this, "NextjsAppService", {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });

    // ロードバランサーの作成
    const lb = new elbv2.ApplicationLoadBalancer(this, "NextjsAppLB", {
      vpc,
      internetFacing: true,
    });

    // リスナーとターゲットグループの設定
    const listener = lb.addListener("NextjsAppListener", {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    listener.addTargets("NextjsAppTarget", {
      port: 3000,
      targets: [service],
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: "/",
        interval: cdk.Duration.seconds(120),  // Reduced frequency to minimize server load
        timeout: cdk.Duration.seconds(5),     // Short timeout for quick failure detection
        healthyThresholdCount: 2,             // Require fewer successful checks to mark as healthy
        unhealthyThresholdCount: 3,           // Require more failed checks to mark as unhealthy
      },
    });

    // 出力
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: lb.loadBalancerDnsName,
      description: "The DNS name of the load balancer",
    });

    new cdk.CfnOutput(this, "SecretARN", {
      value: appSecret.secretArn,
      description: "The ARN of the secret in Secrets Manager",
    });
  }
}
