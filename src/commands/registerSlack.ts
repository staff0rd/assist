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
			"Preview a markdown message bound for a Slack channel (body of - reads it from stdin)",
		)
		.option("--body <body>", "Message body (- reads it from stdin)")
		.option(
			"--thread <ts-or-permalink>",
			"Reply in this thread: a message ts (1712345678.123456) or a Slack archives permalink",
			parseSlackThreadRef,
		)
		.addHelpText(
			"after",
			"\nThe command does not post: Slack is reachable only over MCP, so it previews the message and hands the approved body back for /slack-post to send.\nIn an assist web session the body is previewed for approve/reject first (with inline comments). On approval the body is written to a working file under ~/.assist/slack/ and its path printed on the last line, preceded by the resolved thread_ts when --thread was given. On rejection nothing is handed back: the command exits non-zero with the reason and any inline comments, leaving the previewed markdown in the working file to revise in place.\nOutside a web session there is no preview and the body passes straight through.\nslack_send_message accepts standard markdown as it is — bold, italic, code, blockquotes, lists, links, code blocks, tables and headers — capped at 5000 characters.",
		)
		.action(
			async (
				channel: string | undefined,
				options: { body?: string; thread?: string },
			) => {
				await postSlackMessage(channel, {
					...options,
					body: options.body ? await readBodyArgument(options.body) : undefined,
				});
			},
		);

	configHelp(postCommand, slackConfigHelp);
}
