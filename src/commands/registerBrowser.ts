import type { Command } from "commander";
import { browserInspect } from "./browser/browserInspect";
import { browserRun } from "./browser/browserRun";
import { browserSnapshot } from "./browser/browserSnapshot";
import { browserStatus } from "./browser/browserStatus";
import { browserUpdate } from "./browser/browserUpdate";
import { registerBrowserConsole } from "./browser/registerBrowserConsole";
import { withTargetOptions } from "./browser/withTargetOptions";

export function registerBrowser(program: Command): void {
	const browser = program
		.command("browser")
		.description(
			"Probe the live browser tab through the assist extension, relayed by the assist web server",
		);

	withTargetOptions(
		browser
			.command("status")
			.description(
				"Print the connected extension's version, the target tab's URL and whether the assist content script runs there",
			),
	).action(browserStatus);

	withTargetOptions(
		browser
			.command("snapshot")
			.description(
				"Write the target tab's DOM to ~/.assist/browser/<host>-<timestamp>.html and print its path",
			),
	).action(browserSnapshot);

	withTargetOptions(
		browser
			.command("inspect [selector]")
			.description(
				"Print the ancestor chain (tag#id.class), text and size of each element matching a CSS selector or --text, capped",
			)
			.option(
				"--text <text>",
				"Match elements whose own text contains this, instead of a selector",
			),
	).action(browserInspect);

	withTargetOptions(
		browser
			.command("run")
			.description(
				"Show a script in an approval panel on the target tab and, once the user clicks Run, print its return value or error. The script is the body of an async function: `return` the value to print",
			)
			.requiredOption("--file <script>", "JavaScript file to run"),
	).action(browserRun);

	registerBrowserConsole(browser);

	browser
		.command("update")
		.description(
			"Make the connected extension check for an update and install it now, then print the old and new versions",
		)
		.option(
			"--server <url>",
			"assist web server the extension connects to",
			"http://localhost:3100",
		)
		.action(browserUpdate);
}
