import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { inboxConfigHelp } from "./inbox/inboxConfigHelp";
import { list as inboxList } from "./inbox/list";
import { scan as inboxScan } from "./inbox/scan";

export function registerInbox(program: Command): void {
	const inboxCommand = program
		.command("inbox")
		.description("Triage Gmail and Slack for human messages needing a reply");

	inboxCommand
		.command("scan")
		.description(
			"Scan unread Gmail inbox threads and Slack DMs and @mentions since the last scan with a read-only headless Claude, storing flagged messages",
		)
		.action(inboxScan);

	inboxCommand
		.command("list")
		.description("List flagged inbox messages, newest first")
		.action(inboxList);

	configHelp(inboxCommand, inboxConfigHelp);
}
