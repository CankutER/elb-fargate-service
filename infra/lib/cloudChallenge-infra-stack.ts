import * as cdk from "aws-cdk-lib";

import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { EcsFargateClient } from "./ecs-fargate";
export class CloudChallengeStack extends cdk.Stack {
  private restApi: RestApi;
  private fargateClient: EcsFargateClient;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.restApi = new RestApi(this, "challengeApi");
    this.fargateClient = new EcsFargateClient(this);
    const contentResource = this.restApi.root.addResource("content");
    this.fargateClient.createIntegrations(["content", ""]);
    this.restApi.root.addMethod("GET", this.fargateClient.integrations["root"]);
    contentResource.addMethod(
      "GET",
      this.fargateClient.integrations["content"]
    );
    contentResource.addMethod(
      "POST",
      this.fargateClient.integrations["content"]
    );
  }
}
