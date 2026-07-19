import type { SessionInfo } from "./types";

const REVIEW_COMMANDS = ["review", "review-pr-comments"];

export function reviewTargetPr(session: SessionInfo): number | undefined {
	const command = session.assistArgs?.[0];
	if (!command || !REVIEW_COMMANDS.includes(command)) return undefined;
	const fromArgs = session.assistArgs
		?.slice(1)
		.map((arg) => Number(arg))
		.find((n) => Number.isInteger(n) && n > 0);
	if (fromArgs !== undefined) return fromArgs;
	const fromSubtitle = session.subtitle?.match(/^#(\d+)/);
	return fromSubtitle ? Number(fromSubtitle[1]) : undefined;
}
