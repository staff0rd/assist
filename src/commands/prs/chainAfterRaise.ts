import { chainReviewAndPost } from "./chainReviewAndPost";
import type { BaseRepoMode } from "./resolveBaseRepo";
import { findCurrentPrNumber } from "./shared";

type ChainChoice = {
	reviewAfter?: boolean;
	announceAfter?: boolean;
};

export async function chainAfterRaise(
	prNumber: number | null,
	choice: ChainChoice,
	baseRepo?: BaseRepoMode,
): Promise<void> {
	const review = choice.reviewAfter === true;
	const announce = choice.announceAfter === true;
	if (!review && !announce) return;
	if (process.env.ASSIST_SESSION !== "1") return;

	const number = resolvePrNumber(prNumber, baseRepo);
	if (number === null) return;

	if (review) await chainReviewAndPost(number, announce);
	else printAnnounceInstruction(number);
}

function printAnnounceInstruction(prNumber: number): void {
	console.log(
		`Now run /prs-slack ${prNumber} --no-confirm in this session to post PR #${prNumber} to Slack.`,
	);
}

function resolvePrNumber(
	prNumber: number | null,
	baseRepo?: BaseRepoMode,
): number | null {
	if (prNumber !== null) return prNumber;
	try {
		const found = findCurrentPrNumber(baseRepo);
		if (found === null) warn("no pull request found for the current branch");
		return found;
	} catch (error) {
		warn(error instanceof Error ? error.message : String(error));
		return null;
	}
}

function warn(reason: string): void {
	console.error(`Warning: could not chain sessions after raising: ${reason}`);
}
