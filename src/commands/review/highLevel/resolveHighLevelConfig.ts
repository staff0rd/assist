import type { AssistConfig } from "../../../shared/types";

export type HighLevelConfig = {
	criticalPaths: string[];
	uiPaths: string[];
	descriptionWordCap: number;
};

const DEFAULT_DESCRIPTION_WORD_CAP = 300;

export function resolveHighLevelConfig(config: AssistConfig): HighLevelConfig {
	const highLevel = config.review?.highLevel;
	return {
		criticalPaths: highLevel?.criticalPaths ?? [],
		uiPaths: highLevel?.uiPaths ?? [],
		descriptionWordCap:
			highLevel?.descriptionWordCap ?? DEFAULT_DESCRIPTION_WORD_CAP,
	};
}
