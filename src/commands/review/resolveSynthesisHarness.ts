import { isHarnessAvailable } from "../../shared/harnesses";
import { loadConfig } from "../../shared/loadConfig";
import type { ReviewerHarness } from "./reviewerHarnesses";

export function resolveSynthesisHarness(): ReviewerHarness {
	const configured = loadConfig().review?.synthesisHarness ?? "claude";
	if (configured === "claude" || isHarnessAvailable(configured))
		return configured;
	console.error(
		`review.synthesisHarness is ${configured} but it is not on PATH; synthesising with claude.`,
	);
	return "claude";
}
