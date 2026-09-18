import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { readBodyArgument } from "./prs/readBodyArgument";
import { parseSlackThreadRef } from "./slack/parseSlackThreadRef";
import { postSlackMessage } from "./slack/postSlackMessage";
import { slackConfigHelp } from "./slack/slackConfigHelp";

export function registerSlack(program: Command): void {
	const slackCommand = program.command("slack").description("Slack utilities");

	const postCommand = slackCommand
		.command("post [channel]")
		.description(
			"Preview a markdown message, or a thread of them with --parts, bound for a Slack channel (body of - reads it from stdin)",
		)
		.option("--body <body>", "Message body (- reads it from stdin)")
		.option(
			"--parts <files...>",
			"Files holding the messages of one thread, in thread order (not with --body)",
		)
		.option(
			"--thread <ts-or-permalink>",
			"Reply in this thread: a message ts (1712345678.123456) or a Slack archives permalink",
			parseSlackThreadRef,
		)
		.addHelpText(
			"after",
			"\nThe command does not post: Slack is reachable only over MCP, so it previews the message and hands the approved body back for /slack-post to send.\nIn an assist web session the body is previewed for approve/reject first (with inline comments). On approval the body is written to a working file under ~/.assist/slack/ and its path printed on the last line, preceded by the resolved thread_ts when --thread was given. On rejection nothing is handed back: the command exits non-zero with the reason and any inline comments, leaving the previewed markdown in the working file to revise in place.\n--parts takes the files holding one thread's messages in thread order, each getting its own working file (channel-1.md, channel-2.md, …) and its own preview pane titled with its position in the batch (2/3). The panes pop in sequence and no path is printed until every part is approved, at which point each path prints prefixed with its position (1/3) under a line naming the target, followed by how to thread them: without --thread part 1 opens the thread and the rest carry the thread_ts it returns, with --thread every part is a reply under the resolved thread_ts. The first rejection halts the batch and exits non-zero naming that part's position, reason, inline comments and working file, with no path handed back. A missing or empty part file, or --parts with --body, is an error before any pane opens.\nOutside a web session there is no preview and the body passes straight through.\nslack_send_message accepts standard markdown as it is — bold, italic, code, blockquotes, lists, links, code blocks, tables and headers — capped at 5000 characters.",
		)
		.action(
			async (
				channel: string | undefined,
				options: { body?: string; parts?: string[]; thread?: string },
			) => {
				await postSlackMessage(channel, {
					...options,
					body: options.body ? await readBodyArgument(options.body) : undefined,
				});
			},
		);

	configHelp(postCommand, slackConfigHelp);
}
