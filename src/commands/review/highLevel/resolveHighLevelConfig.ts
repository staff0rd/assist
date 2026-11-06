import { defaultCriticalPaths } from "../../../shared/defaultCriticalPaths";
import type { AssistConfig } from "../../../shared/types";

export type HighLevelConfig = {
	criticalPaths: string[];
	uiPaths: string[];
	descriptionWordCap: number;
	testPaths: string[];
	collapsedPaths: string[];
};

const DEFAULT_DESCRIPTION_WORD_CAP = 300;
const DEFAULT_TEST_PATHS = ["**/*.{test,spec}.{ts,tsx,js,jsx}"];
const DEFAULT_COLLAPSED_PATHS = ["**/*.test.*", "**/generated/**"];

export function resolveHighLevelConfig(config: AssistConfig): HighLevelConfig {
	const highLevel = config.review?.highLevel;
	return {
		criticalPaths: highLevel?.criticalPaths ?? defaultCriticalPaths,
		uiPaths: highLevel?.uiPaths ?? [],
		descriptionWordCap:
			highLevel?.descriptionWordCap ?? DEFAULT_DESCRIPTION_WORD_CAP,
		testPaths: highLevel?.testPaths ?? DEFAULT_TEST_PATHS,
		collapsedPaths: highLevel?.collapsedPaths ?? DEFAULT_COLLAPSED_PATHS,
	};
}
