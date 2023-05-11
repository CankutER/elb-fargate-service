#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ElbFargateStack } from "../lib/elbFargateStack";

const app = new cdk.App();
new ElbFargateStack(app, "ElbFargateStack", {
  stackName: "ElbFargateStack",
});
