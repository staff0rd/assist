import type { HarnessKind } from "../../shared/harnesses";
import { announcePr } from "./announcePr";
import { chainAddressComments } from "./chainAddressComments";
import type { PostOutcome } from "./postAndMaybeSubmit";

type ChainOptions = {
	addressComments: boolean;
	announce: boolean;
	harness?: HarnessKind;
};

export async function chainAfterReview(
	prNumber: number,
	outcome: PostOutcome,
	options: ChainOptions,
): Promise<void> {
	const raisedComments = outcome.posted > 0 && outcome.submitted;
	if (options.addressComments && raisedComments) {
		await chainAddressComments(prNumber, options.announce, options.harness);
		return;
	}
	if (options.announce) await announcePr(prNumber);
}
