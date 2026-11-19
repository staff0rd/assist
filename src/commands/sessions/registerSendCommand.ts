import type { Command } from "commander";
import { lazyAction } from "../../shared/lazyAction";

export function registerSendCommand(cmd: Command): void {
	cmd
		.command("send <id> <text>")
		.description(
			"Submit a prompt in a session (an id from assist sessions list, <node>:<id> for a linked node)",
		)
		.option(
			"--keys",
			String.raw`Send <text> as raw keystrokes instead of a prompt; \r, \n, \t, \e and \xHH are decoded (e.g. '1\r' answers a permission prompt)`,
		)
		.action(lazyAction(() => import("./send/sendToSession"), "sendToSession"));
}
