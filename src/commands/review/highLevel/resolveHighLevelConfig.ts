import type { AssistConfig } from "../../../shared/types";

export type HighLevelConfig = {
	criticalPaths: string[];
	uiPaths: string[];
	descriptionWordCap: number;
	testPaths: string[];
};

const DEFAULT_DESCRIPTION_WORD_CAP = 300;
const DEFAULT_TEST_PATHS = ["**/*.{test,spec}.{ts,tsx,js,jsx}"];

export function resolveHighLevelConfig(config: AssistConfig): HighLevelConfig {
	const highLevel = config.review?.highLevel;
	return {
		criticalPaths: highLevel?.criticalPaths ?? [],
		uiPaths: highLevel?.uiPaths ?? [],
		descriptionWordCap:
			highLevel?.descriptionWordCap ?? DEFAULT_DESCRIPTION_WORD_CAP,
		testPaths: highLevel?.testPaths ?? DEFAULT_TEST_PATHS,
	};
}
