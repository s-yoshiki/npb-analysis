import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const packageDirectory = path.resolve(import.meta.dirname, "..");
const repositoryRoot = path.resolve(packageDirectory, "../..");
const outputDirectory = path.join(packageDirectory, "dist");

await mkdir(path.join(outputDirectory, "data"), { recursive: true });
await build({
  bundle: true,
  entryPoints: [path.join(packageDirectory, "src/lambda.ts")],
  format: "esm",
  outfile: path.join(outputDirectory, "server.mjs"),
  platform: "node",
  sourcemap: true,
  target: "node24",
});
await copyFile(
  path.join(repositoryRoot, "apps/web/data/npb.sqlite"),
  path.join(outputDirectory, "data/npb.sqlite"),
);

console.log(`Lambda asset ready: ${outputDirectory}`);
