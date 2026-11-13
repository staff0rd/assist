import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { hotkeysConfigHelp } from "./hotkeysConfigHelp";
import { nextConfigHelp } from "./nextConfigHelp";
import { webConfigHelp } from "./webConfigHelp";

export function registerSessionsWeb(cmd: Command): void {
	const webCmd = cmd
		.command("web")
		.description("Start the sessions web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
		.option("--no-open", "Do not open a browser on startup")
		.action(async (options, command) =>
			(await import("./web")).web({
				...options,
				open: command.optsWithGlobals().open,
			}),
		);
	configHelp(webCmd, [
		...nextConfigHelp,
		...webConfigHelp,
		...hotkeysConfigHelp,
	]);
}
