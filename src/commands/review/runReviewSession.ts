import { awaitHarness } from "../../shared/awaitHarness";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessKind } from "../../shared/harnesses";
import type { ReviewSession } from "./ReviewSession";

export async function runReviewSession(
	session: ReviewSession,
	synthesisPath: string,
	harness: HarnessKind | undefined,
): Promise<void> {
	const adapter = harnessAdapter(harness);
	const { done } = session.launch(adapter, synthesisPath);
	await awaitHarness(done, session.feature.label, adapter.label);
}
