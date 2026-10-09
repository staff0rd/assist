import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { makeAssistConfig } from "../../test/mothers/makeAssistConfig";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

vi.mock("../../shared/matchesConfigDeny", () => ({
	matchesConfigDeny: () => undefined,
}));

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: () => undefined,
}));

vi.mock("../../shared/matchesAllow", () => ({
	matchesDeny: () => undefined,
}));

import { decideCommand } from "./decideCommand";

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(loadConfig).mockReturnValue(makeAssistConfig());
});

function reasonFor(command: string): string | undefined {
	const decision = decideCommand("Bash", command);
	return decision?.permissionDecision === "deny"
		? decision.permissionDecisionReason
		: undefined;
}

const ISSUE_CREATE = "assist github issue create";
const ISSUE_COMMENT = "assist github issue comment";
const ISSUE_EDIT = "assist github issue edit";
const PR_RAISE = "assist prs raise";
const PR_EDIT = "assist prs edit";
const COMMIT = "assist commit";
const RUN = "assist run";
const BRANCH = "assist branch";
const GH_API = "Do not write to GitHub issues with 'gh api'";

describe("decideCommand denies built-in rules nested in substitutions and subshells", () => {
	it.each([
		["gh pr create --title t", PR_RAISE],
		["gh pr edit 89 --body b", PR_EDIT],
		["gh issue create --title t", ISSUE_CREATE],
		["gh issue edit 1 --add-label bug", ISSUE_EDIT],
		["gh issue comment 1 --body b", ISSUE_COMMENT],
		["git commit -m msg", COMMIT],
		["npm run build", RUN],
		["git checkout -b feature", BRANCH],
		['gh issue close 1 --comment "done"', ISSUE_COMMENT],
		["gh api -X POST repos/acme/widgets/issues -f title=t", GH_API],
	])("denies '%s' however it is wrapped", (command, expected) => {
		for (const wrapped of [
			`x=$(${command})`,
			`x=\`${command}\``,
			`(${command})`,
			`echo $(${command})`,
			`echo "$(${command})"`,
			`echo $(echo $(${command}))`,
			`cd /repo && url=$(${command}); echo $url`,
		]) {
			expect(reasonFor(wrapped), wrapped).toContain(expected);
		}
	});
});

describe("decideCommand regression repros", () => {
	it.each([
		[
			"apm #643 issue create in an assignment",
			'R=owner/repo; url=$(gh issue create -R $R --title "x" --body-file bug.md --label bug --assignee @me); echo $url',
			ISSUE_CREATE,
		],
		[
			"apm #643 issue type mutation",
			`gh api graphql -f query='mutation($i:ID!){updateIssueIssueType(input:{issueId:$i,issueTypeId:"IT_x"}){issue{issueType{name}}}}' -f i=$id`,
			GH_API,
		],
		[
			"apm #643 plain issue edit",
			"gh issue edit 12 -R owner/repo --add-label bug",
			ISSUE_EDIT,
		],
		["backtick issue create", "x=`gh issue create --title t`", ISSUE_CREATE],
		["subshell pr create", "(gh pr create --title t)", PR_RAISE],
		[
			"substituted issue comment",
			"echo $(gh issue comment 1 --body b)",
			ISSUE_COMMENT,
		],
		[
			"a353 commit with a heredoc message",
			"git add . && git commit -m \"$(cat <<'EOF'\nfix: x\nEOF\n)\"",
			COMMIT,
		],
		["a353 commit in backticks", "echo `git commit -m x`", COMMIT],
		[
			"a970 REST issue comment",
			"gh api repos/acme/widgets/issues/1/comments -f body=hi",
			GH_API,
		],
		[
			"a1094 graphql createIssue",
			`gh api graphql -f query='mutation{createIssue(input:{repositoryId:"R_1",title:"t",body:"b"}){issue{url}}}'`,
			GH_API,
		],
		[
			"a1094 graphql label mutation",
			`gh api graphql -f query='mutation($i:ID!,$l:[ID!]!){addLabelsToLabelable(input:{labelableId:$i,labelIds:$l}){clientMutationId}}' -f i=I_1`,
			GH_API,
		],
		[
			"a1094 graphql assignee mutation",
			`gh api graphql -f query='mutation{addAssigneesToAssignable(input:{assignableId:"I_1",assigneeIds:["U_1"]}){clientMutationId}}'`,
			GH_API,
		],
		[
			"a1132 close with a comment",
			'gh issue close 7 --comment "fixed"',
			ISSUE_COMMENT,
		],
		[
			"a1144 graphql write in a substitution",
			`R=$(gh api graphql -f query='mutation($repo:ID!){createIssue(input:{repositoryId:$repo}){issue{id}}}' -f repo=x)`,
			GH_API,
		],
		[
			"a1144 REST write in a quoted substitution with parens in a field",
			'echo "id: $(gh api -X POST repos/acme/widgets/issues -f title="a (b)")"',
			GH_API,
		],
	])("denies %s", (_name, command, expected) => {
		expect(reasonFor(command)).toContain(expected);
	});
});

describe("decideCommand leaves nested reads alone", () => {
	it.each([
		"gh issue view 1",
		"gh issue list --label bug",
		"x=$(gh issue view 1 --json id)",
		"x=`gh issue list --json number`",
		"(gh pr view 89)",
		`gh api graphql -f query='query{repository(owner:"acme",name:"widgets"){issue(number:1){title}}}'`,
		`id=$(gh api graphql -f query='query{repository(owner:"acme",name:"widgets"){issue(number:1){id}}}' --jq .data)`,
		'R="$(gh api repos/acme/widgets/issues/180)"',
		"echo $(gh api repos/acme/widgets/issues/180) -X POST -f x=y",
		`gh api graphql -f query='mutation{addStar(input:{starrableId:"R_1"}){clientMutationId}}'`,
	])("does not deny '%s'", (command) => {
		expect(reasonFor(command)).toBeUndefined();
	});
});
