#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  App,
  CfnOutput,
  Duration,
  Stack,
  type StackProps,
  Tags,
} from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { FunctionUrlOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  DockerImageCode,
  DockerImageFunction,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import type { Construct } from "constructs";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(sourceDirectory, "../../..");
const webDirectory = path.join(repositoryRoot, "apps/web");
const databasePath = path.join(webDirectory, "data/npb.sqlite");

class NpbAnalysisWebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!existsSync(databasePath)) {
      throw new Error(
        `SQLite database not found at ${databasePath}. Run the parser before deploying.`,
      );
    }

    const web = new NextjsGlobalFunctions(this, "Web", {
      buildCommand: "pnpm run build",
      buildDirectory: webDirectory,
      healthCheckPath: "/",
      overrides: {
        nextjsFunctions: {
          dockerImageFunctionProps: {
            memorySize: 1024,
            timeout: Duration.seconds(30),
          },
        },
      },
    });

    const searchFunction = new DockerImageFunction(this, "SearchFunction", {
      code: DockerImageCode.fromImageAsset(repositoryRoot, {
        file: "apps/api/Dockerfile",
      }),
      description: "Read-only NPB player search API backed by bundled SQLite",
      memorySize: 1024,
      timeout: Duration.seconds(15),
    });
    const searchFunctionUrl = searchFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.AWS_IAM,
    });

    const distribution = web.nextjsDistribution.distribution;
    distribution.addBehavior(
      "api/*",
      FunctionUrlOrigin.withOriginAccessControl(searchFunctionUrl),
      {
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    );

    searchFunction.addPermission("InvokeViaFunctionUrlFromCloudFront", {
      action: "lambda:InvokeFunction",
      invokedViaFunctionUrl: true,
      principal: new ServicePrincipal("cloudfront.amazonaws.com"),
      sourceArn: distribution.distributionArn,
    });

    new CfnOutput(this, "WebUrl", {
      description: "CloudFront URL for the NPB analysis site",
      value: web.url,
    });
    new CfnOutput(this, "DistributionId", {
      description: "CloudFront distribution ID",
      value: distribution.distributionId,
    });
  }
}

const app = new App();
const stack = new NpbAnalysisWebStack(app, "NpbAnalysisWebStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  description:
    "Next.js ISR on CloudFront and Lambda with a separate player search API",
});

Tags.of(stack).add("Application", "npb-analysis");
Tags.of(stack).add("ManagedBy", "aws-cdk");

app.synth();
