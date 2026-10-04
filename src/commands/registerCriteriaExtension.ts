import type { Command } from "commander";
import { criteriaExtension } from "./criteriaExtension/criteriaExtension";
import { printCriteriaExtensionUrl } from "./criteriaExtension/printCriteriaExtensionUrl";
import { signCriteriaExtension } from "./criteriaExtension/signCriteriaExtension";

export function registerCriteriaExtension(program: Command): void {
	program
		.command("criteria-extension")
		.description(
			"Print the directory to load the acceptance criteria outliner browser extension from (load unpacked)",
		)
		.option(
			"--sign",
			"Sign the extension on AMO's unlisted channel and print the .xpi to install permanently in Firefox (needs WEB_EXT_API_KEY and WEB_EXT_API_SECRET)",
		)
		.option(
			"--url",
			"Print the download URL of the latest signed Firefox build, read from the update manifest on main",
		)
		.action((options: { sign?: boolean; url?: boolean }) => {
			if (options.url) return printCriteriaExtensionUrl();
			return options.sign ? signCriteriaExtension() : criteriaExtension();
		});
}
