import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/npb/infrastructure/**"],
              message:
                "UIからInfrastructure層へ直接依存せず、Application層またはComposition Rootを利用してください。",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/npb/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next/**",
                "react",
                "react/**",
                "@/modules/npb/application/**",
                "@/modules/npb/infrastructure/**",
              ],
              message:
                "Domain層はUI、Application、Infrastructureへ依存できません。",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/npb/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next/**",
                "react",
                "react/**",
                "node:sqlite",
                "@/modules/npb/infrastructure/**",
              ],
              message:
                "Application層はUIやDB実装へ依存せず、Repositoryポートを利用してください。",
            },
          ],
        },
      ],
    },
  },
];
