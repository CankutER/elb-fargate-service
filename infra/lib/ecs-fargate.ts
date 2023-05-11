import { aws_ec2 } from "aws-cdk-lib";

import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import path = require("path");

export class EcsFargateClient {
  private fargateService: ApplicationLoadBalancedFargateService;
  private vpc: Vpc;
  private loadBalancer: ApplicationLoadBalancer;
  constructor(private scope: Construct) {
    this.vpc = new Vpc(scope, "elbFargateServiceVpc", {
      maxAzs: 2,
      subnetConfiguration: [
        { name: "ElbFargateServicePublic", subnetType: SubnetType.PUBLIC },
        {
          name: "ElbFargateServicePrivate",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    this.fargateService = new ApplicationLoadBalancedFargateService(
      scope,
      "fargateService",
      {
        vpc: this.vpc,
        taskSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        publicLoadBalancer: true,
        desiredCount: 1,
        taskImageOptions: {
          containerName: "backendContainer",
          containerPort: 80,
          image: ContainerImage.fromAsset(path.resolve("..", "backend")),
        },
      }
    );

    this.fargateService.service.connections.allowFromAnyIpv4(
      aws_ec2.Port.allTraffic()
    );
    this.loadBalancer = this.fargateService.loadBalancer;
  }
}
