import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";

export function registerPrsThreadReplies(
	prsCommand: Command,
	calledBy: string,
): void {
	internalCommand(
		prsCommand
			.command("fixed <comment-id> <sha>")
			.description("Reply with commit link and resolve thread")
			.action(async (commentId: string, sha: string) => {
				const { fixed: prsFixed } = await import("./prs/fixed");
				prsFixed(Number.parseInt(commentId, 10), sha);
			}),
		calledBy,
	);

	internalCommand(
		prsCommand
			.command("wontfix <comment-id> <reason>")
			.description(
				"Reply with reason and resolve thread (reason of - reads it from stdin)",
			)
			.action(async (commentId: string, reason: string) => {
				const { readBodyArgument } = await import("./prs/readBodyArgument");
				const { wontfix: prsWontfix } = await import("./prs/wontfix");
				await prsWontfix(
					Number.parseInt(commentId, 10),
					await readBodyArgument(reason),
				);
			}),
		calledBy,
	);

	internalCommand(
		prsCommand
			.command("reply <comment-id> <body>")
			.description(
				"Reply to a comment thread without resolving it (body of - reads it from stdin)",
			)
			.action(async (commentId: string, body: string) => {
				const { readBodyArgument } = await import("./prs/readBodyArgument");
				const { reply: prsReply } = await import("./prs/reply");
				await prsReply(
					Number.parseInt(commentId, 10),
					await readBodyArgument(body),
				);
			}),
		calledBy,
	);
}
