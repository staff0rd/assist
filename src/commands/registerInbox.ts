import { type Command, Option } from "commander";
import { configHelp } from "../shared/configHelp";
import { harnesses } from "../shared/harnesses";
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
			"Scan unread Gmail inbox threads and Slack DMs and @mentions since the last scan with a read-only headless harness, storing flagged messages",
		)
		.addOption(
			new Option(
				"--harness <kind>",
				"Harness to scan with; defaults to Claude. Exits with the reasons, before spawning, when the inbox scan is unavailable on it (it needs read-only Gmail and Slack connectors and a tool allow-list)",
			).choices(Object.keys(harnesses)),
		)
		.action(inboxScan);

	inboxCommand
		.command("list")
		.description("List flagged inbox messages, newest first")
		.action(inboxList);

	configHelp(inboxCommand, inboxConfigHelp);
}
