import { aws_ec2, CfnOutput, RemovalPolicy, SecretValue } from "aws-cdk-lib";
import {
  ConnectionType,
  Integration,
  IntegrationType,
  RestApi,
  VpcLink,
} from "aws-cdk-lib/aws-apigateway";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { ContainerImage } from "aws-cdk-lib/aws-ecs";
import { NetworkLoadBalancedFargateService } from "aws-cdk-lib/aws-ecs-patterns";
import { ClusterParameterGroup, DatabaseCluster } from "aws-cdk-lib/aws-docdb";
import { Construct } from "constructs";
import path = require("path");
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

interface apiIntegrations {
  [key: string]: Integration;
}

export class EcsFargateClient {
  private fargateService: NetworkLoadBalancedFargateService;
  private vpc: Vpc;
  private vpcLink: VpcLink;
  private database: DatabaseCluster;
  public integrations: apiIntegrations = {};
  constructor(private scope: Construct) {
    this.vpc = new Vpc(scope, "challengeVpc", {
      maxAzs: 2,
      subnetConfiguration: [
        { name: "ChallengePublicSubnet1", subnetType: SubnetType.PUBLIC },
        {
          name: "challengePrivateSubnet1",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: "challengePrivateSubnet2",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
    const clusterParamGroup = new ClusterParameterGroup(
      scope,
      "clusterParamGrp",
      {
        family: "docdb4.0",
        description: "tls disabled",
        parameters: {
          tls: "disabled",
        },
      }
    );
    // const docDbSecret = new Secret(scope, "docDbPass", {
    //   secretName: "docDbPass",
    //   generateSecretString: {
    //     excludeCharacters: "/'[]}{#$&",
    //     excludePunctuation: true,
    //   },
    // });
    this.database = new DatabaseCluster(scope, "ChallengeDb", {
      masterUser: {
        username: "challengeUser",
        secretName: "challengeSecret",
        excludeCharacters: "/'[]}{#$&\"@:;?",
      },
      parameterGroup: clusterParamGroup,
      removalPolicy: RemovalPolicy.DESTROY,
      vpc: this.vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    this.fargateService = new NetworkLoadBalancedFargateService(
      scope,
      "fargateService",
      {
        vpc: this.vpc,
        taskSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },

        desiredCount: 1,
        taskImageOptions: {
          containerName: "challengeContainer",
          containerPort: 80,
          image: ContainerImage.fromAsset(
            path.resolve("..", "challenge-backend")
          ),
          environment: {
            DB_PASSWORD: SecretValue.secretsManager("challengeSecret", {
              jsonField: "password",
            }).unsafeUnwrap(),
            DB_USERNAME: "challengeUser",
            DB_LINK: this.database.clusterEndpoint.socketAddress,
          },
        },
      }
    );
    this.database.connections.allowDefaultPortFrom(this.fargateService.service);
    this.fargateService.service.connections.allowFromAnyIpv4(
      aws_ec2.Port.allTraffic()
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
      const correctedResource = resource.length ? resource : "root";
      this.integrations[correctedResource] = new Integration({
        type: IntegrationType.HTTP_PROXY,
        uri: `http://${this.fargateService.loadBalancer.loadBalancerDnsName}/${resource}`,
        integrationHttpMethod: "ANY",
        options: {
          connectionType: ConnectionType.VPC_LINK,
          vpcLink: this.vpcLink,
        },
      });
    });
  }
}
