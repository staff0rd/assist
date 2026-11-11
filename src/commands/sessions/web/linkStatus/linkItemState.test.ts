import { describe, expect, it } from "vitest";
import { linkItemState } from "./linkItemState";

describe("linkItemState", () => {
	it.each([
		[{ __typename: "Issue", state: "OPEN" }, "issue-open"],
		[
			{ __typename: "Issue", state: "CLOSED", stateReason: "COMPLETED" },
			"issue-completed",
		],
		[
			{ __typename: "Issue", state: "CLOSED", stateReason: "NOT_PLANNED" },
			"issue-not-planned",
		],
		[{ __typename: "PullRequest", state: "OPEN", isDraft: true }, "pr-draft"],
		[{ __typename: "PullRequest", state: "MERGED" }, "pr-merged"],
		[null, null],
	])("maps %j to %s", (item, state) => {
		expect(linkItemState(item)).toBe(state);
	});
});
