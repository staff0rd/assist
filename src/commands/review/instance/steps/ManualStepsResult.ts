import type { StepVerdict } from "./StepVerdict";

export type ManualStepsResult = {
	verdicts: StepVerdict[];
	video?: string;
	ignoredErrors?: number;
};
