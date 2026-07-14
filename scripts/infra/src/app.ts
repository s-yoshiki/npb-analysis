#!/usr/bin/env node
import { App, CfnOutput, Stack, Tags, type StackProps } from "aws-cdk-lib";
import { NextjsGlobalFunctions } from "cdk-nextjs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Construct } from "constructs";

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
      healthCheckPath: "/api/health",
      overrides: {
        nextjsFunctions: {
          dockerImageFunctionProps: {
            memorySize: 1024,
          },
        },
      },
    });

    new CfnOutput(this, "WebUrl", {
      description: "CloudFront URL for the NPB analysis site",
      value: web.url,
    });

    new CfnOutput(this, "DistributionId", {
      description: "CloudFront distribution ID",
      value: web.nextjsDistribution.distribution.distributionId,
    });
  }
}

const app = new App();
const stack = new NpbAnalysisWebStack(app, "NpbAnalysisWebStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
  },
  description: "CloudFront and Lambda deployment for the NPB analysis site",
});

Tags.of(stack).add("Application", "npb-analysis");
Tags.of(stack).add("ManagedBy", "aws-cdk");

app.synth();
