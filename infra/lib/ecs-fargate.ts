import { CfnOutput, aws_ec2 } from "aws-cdk-lib";

import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
} from "aws-cdk-lib/aws-ecs";
import { ApplicationLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import {
  ApplicationLoadBalancer,
  CfnTargetGroup,
  ListenerAction,
  ListenerCondition,
  TargetGroupBase,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";
import path = require("path");

export class EcsFargateClient {
  private fargateServiceOne: ApplicationLoadBalancedFargateService;
  private fargateServiceTwo: FargateService;
  private vpc: Vpc;
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

    this.fargateServiceOne = new ApplicationLoadBalancedFargateService(
      scope,
      "fargateServiceOne",
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
    // NEW CODE FOR DISTRIBUTING TRAFFIC PATH BASED BETWEEN SERVICES

    const taskDefiniton2 = new FargateTaskDefinition(
      scope,
      "taskDefForSecondService"
    );
    const task2Container = taskDefiniton2.addContainer("backend2Container", {
      containerName: "backend2Container",
      image: ContainerImage.fromAsset(path.resolve("..", "backend-2")),
      portMappings: [{ containerPort: 80 }],
      logging: LogDrivers.awsLogs({ streamPrefix: "service2" }),
    });

    this.fargateServiceTwo = new FargateService(scope, "fargateServiceTwo", {
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      cluster: this.fargateServiceOne.cluster,
      taskDefinition: taskDefiniton2,
      desiredCount: 1,
    });
    this.fargateServiceTwo.connections.allowFrom(
      this.fargateServiceOne.loadBalancer,
      aws_ec2.Port.tcp(80)
    );
    this.fargateServiceOne.loadBalancer.listeners[0].addTargets(
      "secondServiceTarget",
      {
        targets: [this.fargateServiceTwo],
        port: 80,
        conditions: [ListenerCondition.pathPatterns(["/content"])],
        priority: 100,
      }
    );

    //BELOW CODE DOESNT WORK SINCE ECS_PATTERNS CONSTRUCT DOESNT SUPPORT MULTI FARGATE SERVICES FOR THE SAME ALB

    /*  this.fargateServiceTwo = new ApplicationLoadBalancedFargateService(
      scope,
      "fargateServiceTwo",
      {
        vpc: this.vpc,
        taskSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        publicLoadBalancer: true,
        loadBalancer: this.fargateServiceOne.loadBalancer,
        desiredCount: 1,
        taskImageOptions: {
          containerName: "backend2Container",
          containerPort: 80,
          image: ContainerImage.fromAsset(path.resolve("..", "backend-2")),
        },
      }
    ); */

    /* this.fargateServiceOne.loadBalancer.listeners[0].addAction("act1", {
      action: ListenerAction.forward([this.fargateServiceOne.targetGroup]),
      conditions: [ListenerCondition.pathPatterns(["/name"])],
    });   */
  }
}
