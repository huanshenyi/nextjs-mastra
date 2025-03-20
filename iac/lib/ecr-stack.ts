import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class EcrStack extends cdk.Stack {
  // ECRリポジトリをパブリックプロパティとして公開
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECRリポジトリの作成
    this.repository = new ecr.Repository(this, "NextjsAppRepository", {
      repositoryName: "nextjs-mastra",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      imageScanOnPush: true,
    });

    // 出力
    new cdk.CfnOutput(this, "ECRRepositoryURI", {
      value: this.repository.repositoryUri,
      description: "The URI of the ECR repository",
    });
  }
}
