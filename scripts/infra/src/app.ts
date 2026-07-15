#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  App,
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
  Tags,
} from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  Function as CloudFrontFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  FunctionRuntime,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import {
  FunctionUrlOrigin,
  S3BucketOrigin,
} from "aws-cdk-lib/aws-cloudfront-origins";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {
  DockerImageCode,
  DockerImageFunction,
  FunctionUrlAuthType,
} from "aws-cdk-lib/aws-lambda";
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(sourceDirectory, "../../..");
const webDirectory = path.join(repositoryRoot, "apps/web");
const staticOutputDirectory = path.join(webDirectory, "out");
const databasePath = path.join(webDirectory, "data/npb.sqlite");

class NpbAnalysisWebStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!existsSync(databasePath)) {
      throw new Error(
        `SQLite database not found at ${databasePath}. Run the parser before deploying.`,
      );
    }
    if (!existsSync(staticOutputDirectory)) {
      throw new Error(
        `Static web output not found at ${staticOutputDirectory}. Run the web build before deploying.`,
      );
    }

    const siteBucket = new Bucket(this, "SiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
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

    const staticUriRewrite = new CloudFrontFunction(this, "StaticUriRewrite", {
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  if (request.uri.indexOf('/players/') === 0) {
    var playerId = request.uri.substring('/players/'.length);
    if (playerId.endsWith('/')) {
      playerId = playerId.substring(0, playerId.length - 1);
    }
    if (playerId && playerId.indexOf('/') === -1 && playerId !== 'detail') {
      request.uri = '/players/detail/index.html';
      return request;
    }
  }
  if (request.uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!request.uri.split('/').pop().includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}
      `),
      runtime: FunctionRuntime.JS_2_0,
    });

    const distribution = new Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        functionAssociations: [
          {
            eventType: FunctionEventType.VIEWER_REQUEST,
            function: staticUriRewrite,
          },
        ],
      },
      additionalBehaviors: {
        "api/*": {
          origin: FunctionUrlOrigin.withOriginAccessControl(searchFunctionUrl),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy:
            OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    searchFunction.addPermission("InvokeViaFunctionUrlFromCloudFront", {
      action: "lambda:InvokeFunction",
      invokedViaFunctionUrl: true,
      principal: new ServicePrincipal("cloudfront.amazonaws.com"),
      sourceArn: distribution.distributionArn,
    });

    new BucketDeployment(this, "DeployStaticSite", {
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
      prune: true,
      sources: [Source.asset(staticOutputDirectory)],
    });

    new CfnOutput(this, "WebUrl", {
      description: "CloudFront URL for the NPB analysis site",
      value: `https://${distribution.distributionDomainName}`,
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
    "Static NPB site on S3/CloudFront with a Lambda Function URL search API",
});

Tags.of(stack).add("Application", "npb-analysis");
Tags.of(stack).add("ManagedBy", "aws-cdk");

app.synth();
