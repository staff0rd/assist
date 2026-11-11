import type { LinkState } from "./LinkState";

export type LinkItem = {
	__typename?: string;
	state?: string;
	stateReason?: string | null;
	isDraft?: boolean;
};

function issueState({ state, stateReason }: LinkItem): LinkState {
	if (state === "OPEN") return "issue-open";
	return stateReason === "NOT_PLANNED" || stateReason === "DUPLICATE"
		? "issue-not-planned"
		: "issue-completed";
}

function pullState({ state, isDraft }: LinkItem): LinkState {
	if (state === "MERGED") return "pr-merged";
	if (state === "CLOSED") return "pr-closed";
	return isDraft ? "pr-draft" : "pr-open";
}

export function linkItemState(
	item: LinkItem | null | undefined,
): LinkState | null {
	if (item?.__typename === "Issue") return issueState(item);
	if (item?.__typename === "PullRequest") return pullState(item);
	return null;
}
