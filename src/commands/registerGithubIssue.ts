import type { Command } from "commander";
import { registerFixStructure } from "./github/issue/fixStructure/registerFixStructure";
import { registerCommentIssue } from "./github/issue/registerCommentIssue";
import { registerCreateIssue } from "./github/issue/registerCreateIssue";
import { registerEditIssue } from "./github/issue/registerEditIssue";
import { registerEditIssueComment } from "./github/issue/registerEditIssueComment";

export function registerGithubIssue(githubCommand: Command): void {
	const issueCommand = githubCommand
		.command("issue")
		.description("GitHub issue utilities");

	registerCreateIssue(issueCommand);
	registerEditIssue(issueCommand);
	registerCommentIssue(issueCommand);
	registerEditIssueComment(issueCommand);
	registerFixStructure(issueCommand);
}
