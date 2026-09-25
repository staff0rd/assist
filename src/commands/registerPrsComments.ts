import type { Command } from "commander";
import { comment as prsComment } from "./prs/comment";
import { fixed as prsFixed } from "./prs/fixed";
import { listComments as prsListComments } from "./prs/listComments";
import { printComments as prsPrintComments } from "./prs/listComments/printComments";
import { readBodyArgument } from "./prs/readBodyArgument";
import { reply as prsReply } from "./prs/reply";
import { wontfix as prsWontfix } from "./prs/wontfix";

export function registerPrsComments(prsCommand: Command): void {
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
		.description(
			"Reply with reason and resolve thread (reason of - reads it from stdin)",
		)
		.action(async (commentId: string, reason: string) => {
			await prsWontfix(
				Number.parseInt(commentId, 10),
				await readBodyArgument(reason),
			);
		});

	prsCommand
		.command("reply <comment-id> <body>")
		.description(
			"Reply to a comment thread without resolving it (body of - reads it from stdin)",
		)
		.action(async (commentId: string, body: string) => {
			await prsReply(
				Number.parseInt(commentId, 10),
				await readBodyArgument(body),
			);
		});

	prsCommand
		.command("comment <path> <line> <body>")
		.description(
			"Add a line comment to the pending review (body of - reads it from stdin)",
		)
		.action(async (path: string, line: string, body: string) => {
			await prsComment(
				path,
				Number.parseInt(line, 10),
				await readBodyArgument(body),
			);
		});
}
