import type { HarnessKind } from "../../shared/harnesses";
import { requestAssistSession } from "../sessions/shared/requestAssistSession";
import { startChainedSession } from "./startChainedSession";

export function chainAddressComments(
	prNumber: number,
	announce: boolean,
	harness?: HarnessKind,
): Promise<void> {
	const args = ["review-pr-comments", String(prNumber)];
	if (harness) args.push("--harness", harness);
	if (announce) args.push("--announce");
	return startChainedSession(
		`an Address Comments session for PR #${prNumber}`,
		() => requestAssistSession(args, process.cwd(), { inPlace: true }),
	);
}
