import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { EcsFargateClient } from "./ecs-fargate";
export class TestInfraStack extends cdk.Stack {
  private restApi: RestApi;
  private fargateClient: EcsFargateClient;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.restApi = new RestApi(this, "testApi");
    this.fargateClient = new EcsFargateClient(this);
    const contentResource = this.restApi.root.addResource("content");
    this.fargateClient.createIntegrations(["content"]);
    contentResource.addMethod(
      "GET",
      this.fargateClient.integrations["content"]
    );
  }
}
