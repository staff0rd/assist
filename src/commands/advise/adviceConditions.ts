import type { AssistConfig } from "../../shared/types";

export type AdviceContext = {
	config: AssistConfig;
	rootDir: string;
};

type AdviceCondition = {
	whenMet: string;
	whenUnmet: string;
	matches: (context: AdviceContext) => boolean;
};

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
};
