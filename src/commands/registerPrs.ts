import type { Command } from "commander";
import {
	prs,
	comment as prsComment,
	fixed as prsFixed,
	listComments as prsListComments,
	printComments as prsPrintComments,
	wontfix as prsWontfix,
} from "./prs/index";

export function registerPrs(program: Command): void {
	const prsCommand = program
		.command("prs")
		.description("Pull request utilities")
		.option("--open", "List only open pull requests")
		.option("--closed", "List only closed pull requests")
		.action(prs);

	prsCommand
		.command("list-comments")
		.description("List all comments on the current branch's pull request")
		.action(() => {
			prsListComments().then(prsPrintComments);
		});

	prsCommand
		.command("fixed <comment-id> <sha>")
		.description("Reply with commit link and resolve thread")
		.action((commentId: string, sha: string) => {
			prsFixed(Number.parseInt(commentId, 10), sha);
		});

	prsCommand
		.command("wontfix <comment-id> <reason>")
		.description("Reply with reason and resolve thread")
		.action((commentId: string, reason: string) => {
			prsWontfix(Number.parseInt(commentId, 10), reason);
		});

	prsCommand
		.command("comment <path> <line> <body>")
		.description("Add a line comment to the pending review")
		.action((path: string, line: string, body: string) => {
			prsComment(path, Number.parseInt(line, 10), body);
		});
}
