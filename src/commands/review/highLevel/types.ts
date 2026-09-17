import type { HighLevelCheck } from "./highLevelChecklist";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

type HighLevelCheckStatus = "pass" | "fail" | "manual";

export type CheckOutcome = {
	status: "pass" | "fail";
	reason: string;
};

export type HighLevelCheckResult = HighLevelCheck & {
	status: HighLevelCheckStatus;
	reason: string;
};

export type HighLevelSubject = {
	body: string;
	changedFiles: string[];
	config: HighLevelConfig;
};
