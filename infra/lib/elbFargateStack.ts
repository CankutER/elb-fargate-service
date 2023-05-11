import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { EcsFargateClient } from "./ecs-fargate";
export class ElbFargateStack extends cdk.Stack {
  private fargateClient: EcsFargateClient;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.fargateClient = new EcsFargateClient(this);
  }
}
