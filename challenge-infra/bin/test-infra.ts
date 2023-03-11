#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TestInfraStack } from "../lib/test-infra-stack";

const app = new cdk.App();
new TestInfraStack(app, "TestInfraStack", {
  stackName: "TestInfraStack",
});
