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

    // タスク定義の作成（タスクロールを追加）- ベストプラクティスに準拠
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "NextjsAppTaskDef",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
        executionRole,
        taskRole, // タスクロールを指定
        ephemeralStorageGiB: 21, // 一時ストレージを増加（デフォルト20GiB）
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.ARM64, // ARM64でコスト効率向上
        },
      }
    );

    // コンテナの定義 - ベストプラクティスに準拠
    const container = taskDefinition.addContainer("NextjsAppContainer", {
      // 指定されたタグがある場合はそのタグを使用し、ない場合は最新のイメージを使用
      image: props.imageTag
        ? ecs.ContainerImage.fromEcrRepository(repository, props.imageTag)
        : ecs.ContainerImage.fromEcrRepository(repository),
      logging: ecs.LogDrivers.awsLogs({ 
        streamPrefix: "nextjs-app",
        logRetention: 30, // ログを30日間保持
      }),
      secrets: {
        REGION: ecs.Secret.fromSecretsManager(appSecret, "REGION"),
        PUBLICK_KEY: ecs.Secret.fromSecretsManager(appSecret, "PUBLICK_KEY"),
        SECRET_KEY: ecs.Secret.fromSecretsManager(appSecret, "SECRET_KEY"),
        BASE_URL: ecs.Secret.fromSecretsManager(appSecret, "BASE_URL"),
      },
      environment: {
        NODE_ENV: "production",
      },
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
      essential: true,
      readonlyRootFilesystem: true, // セキュリティ強化のためにファイルシステムを読み取り専用に設定
    });

    // コンテナのポートマッピング
    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // ECSサービスの作成 - ベストプラクティスに基づいた最適化
    const service = new ecs.FargateService(this, "NextjsAppService", {
      cluster,
      taskDefinition,
      desiredCount: 2, // 高可用性のために少なくとも2つのタスクを実行
      minHealthyPercent: 100, // デプロイメント中も100%のヘルシーなタスクを維持
      maxHealthyPercent: 200, // スケーリング時の余裕を持たせる
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT', // コスト最適化のためのFARGATE_SPOT
          weight: 2,
        },
        {
          capacityProvider: 'FARGATE',
          weight: 1,
        }
      ],
      assignPublicIp: false, // セキュリティのためにプライベートサブネットで実行
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, // プライベートサブネットを使用
      securityGroups: [
        new ec2.SecurityGroup(this, 'EcsServiceSecurityGroup', {
          vpc,
          description: 'Security group for NextJS ECS service',
          allowAllOutbound: true,
        })
      ],
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS, // ローリングアップデートを使用
      },
      circuitBreaker: { rollback: true }, // 障害時に自動ロールバック
      enableExecuteCommand: true, // デバッグのためのECSエグゼックコマンドを有効化
    });

    // CloudWatchアラームの設定
    service.metricCpuUtilization().createAlarm(this, 'CpuUtilizationAlarm', {
      threshold: 80,
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
    });

    service.metricMemoryUtilization().createAlarm(this, 'MemoryUtilizationAlarm', {
      threshold: 80,
      evaluationPeriods: 3,
      datapointsToAlarm: 2,
    });

    // Auto Scalingの設定
    const scaling = service.autoScaleTaskCount({
      minCapacity: 2,
      maxCapacity: 6,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    scaling.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(300),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // サービスのタグ付け
    cdk.Tags.of(service).add('Environment', 'Production');
    cdk.Tags.of(service).add('Service', 'NextjsApp');
    cdk.Tags.of(service).add('ManagedBy', 'CDK');

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
        path: "/api/health", // より適切なヘルスチェックエンドポイント
        interval: cdk.Duration.seconds(30), // より頻繁なヘルスチェック
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: "200-299", // 成功ステータスコードの範囲
      },
      deregistrationDelay: cdk.Duration.seconds(30), // ターゲットの登録解除の遅延を短縮
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
