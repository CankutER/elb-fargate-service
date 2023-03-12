#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CloudChallengeStack } from "../lib/cloudChallenge-infra-stack";

const app = new cdk.App();
new CloudChallengeStack(app, "CloudChallengeStack", {
  stackName: "CloudChallengeStack",
});
