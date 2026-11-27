import type { ReportedCheckout } from "../checkouts/ReportedCheckout";
import type { StepVerdict } from "./StepVerdict";

export type ManualStepsResult = {
	checkouts?: ReportedCheckout[];
	verdicts: StepVerdict[];
	video?: string;
	ignoredErrors?: number;
};
