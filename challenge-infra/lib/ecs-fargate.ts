import { aws_ec2, CfnOutput } from "aws-cdk-lib";
import {
  ConnectionType,
  Integration,
  IntegrationType,
  RestApi,
  VpcLink,
} from "aws-cdk-lib/aws-apigateway";
import { SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { NetworkLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { Construct } from "constructs";
import path = require("path");

interface apiIntegrations {
  [key: string]: Integration;
}

export class EcsFargateClient {
  private fargateService: NetworkLoadBalancedFargateService;
  private vpc: Vpc;
  private vpcLink: VpcLink;
  public integrations: apiIntegrations = {};
  constructor(private scope: Construct) {
    this.vpc = new Vpc(scope, "fargateVpc", {
      maxAzs: 1,
      subnetConfiguration: [
        { name: "publicSubnet", subnetType: SubnetType.PUBLIC },
        { name: "privateSubnet", subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });
    this.fargateService = new NetworkLoadBalancedFargateService(
      scope,
      "fargateService",
      {
        vpc: this.vpc,
        taskSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        desiredCount: 1,
        taskImageOptions: {
          containerName: "testContainer",
          containerPort: 80,
          image: ContainerImage.fromAsset(path.resolve("..", "test-backend")),
        },
      }
    );
    this.fargateService.service.connections.allowFromAnyIpv4(
      aws_ec2.Port.tcp(80)
    );
    this.vpcLink = new VpcLink(scope, "vpcLink", {
      vpcLinkName: "fargateLink",
      targets: [this.fargateService.loadBalancer],
    });
    const resource = "content";
    const uri = `http://${this.fargateService.loadBalancer.loadBalancerDnsName}/${resource}`;
    new CfnOutput(scope, "loadBalancerDns", {
      description: "NLB-DNS",
      value: uri,
    });
  }
  createIntegrations(apiResources: string[]) {
    apiResources.forEach((resource) => {
      this.integrations[resource] = new Integration({
        type: IntegrationType.HTTP_PROXY,
        uri: `http://${this.fargateService.loadBalancer.loadBalancerDnsName}/${resource}`,
        integrationHttpMethod: "GET",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: this.vpcLink,
        },
      });
    });
  }
}
