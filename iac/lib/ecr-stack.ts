import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class EcrStack extends cdk.Stack {
  // ECRリポジトリをパブリックプロパティとして公開
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECRリポジトリの作成 - ベストプラクティスに準拠
    this.repository = new ecr.Repository(this, "NextjsAppRepository", {
      repositoryName: "nextjs-mastra",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true,
      imageTagMutability: ecr.TagMutability.IMMUTABLE, // タグの不変性を保証
      lifecycleRules: [
        {
          description: 'Keep only the last 5 images',
          maxImageCount: 5,
          rulePriority: 1,
        },
        {
          description: 'Remove untagged images after 1 day',
          tagStatus: ecr.TagStatus.UNTAGGED,
          maxImageAge: cdk.Duration.days(1),
          rulePriority: 2,
        }
      ],
      encryption: ecr.RepositoryEncryption.KMS, // KMSによる暗号化
    });
    
    // リポジトリのタグ付け
    cdk.Tags.of(this.repository).add('Service', 'NextjsApp');
    cdk.Tags.of(this.repository).add('ManagedBy', 'CDK');

    // 出力
    new cdk.CfnOutput(this, "ECRRepositoryURI", {
      value: this.repository.repositoryUri,
      description: "The URI of the ECR repository",
    });
  }
}
