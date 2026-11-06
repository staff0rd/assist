import { existsSync } from "node:fs";
import { join } from "node:path";
import { askQuestionEnabled } from "../askQuestion/askQuestionEnabled";
import type { AdviceContext } from "./AdviceContext";
import { verifyRunCommandNames } from "./verifyRunCommandNames";

type AdviceCondition = {
	whenMet: string;
	whenUnmet: string;
	matches: (context: AdviceContext) => boolean;
};

function repoFile(file: string, label: string): AdviceCondition {
	return {
		whenMet: `the repo has ${label}`,
		whenUnmet: `the repo has no ${label}`,
		matches: ({ rootDir }) => existsSync(join(rootDir, file)),
	};
}

export const adviceConditions: Record<string, AdviceCondition> = {
	always: {
		whenMet: "always included",
		whenUnmet: "always included",
		matches: () => true,
	},
	jira: {
		whenMet: "jira is configured",
		whenUnmet: "jira is not configured",
		matches: ({ config }) => config.jira !== undefined,
	},
	assistSession: {
		whenMet: "the session was launched by assist",
		whenUnmet: "the session was not launched by assist",
		matches: ({ assistSession }) => assistSession,
	},
	askQuestion: {
		whenMet: "sessions.askQuestion is on in an assist-launched session",
		whenUnmet:
			"the session was not launched by assist, or sessions.askQuestion is off",
		matches: ({ assistSession, config }) =>
			assistSession && askQuestionEnabled(config),
	},
	typescript: repoFile("tsconfig.json", "a tsconfig.json"),
	filenameConvention: repoFile(
		join("oxlint-rules", "filenameConvention.ts"),
		"oxlint-rules/filenameConvention.ts",
	),
	claudeSettings: repoFile(
		join("claude", "settings.json"),
		"claude/settings.json",
	),
	verify: {
		whenMet: "the repo has verify commands",
		whenUnmet: "the repo has no verify* run command",
		matches: (context) =>
			context.config.advice?.verify !== undefined ||
			verifyRunCommandNames(context).length > 0,
	},
};
