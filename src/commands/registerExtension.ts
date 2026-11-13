import type { Command } from "commander";

export function registerExtension(program: Command): void {
	program
		.command("extension")
		.description(
			"Print the directory to load the assist browser extension from (load unpacked)",
		)
		.option(
			"--sign",
			"Sign the extension on AMO's unlisted channel and print the .xpi to install permanently in Firefox (needs WEB_EXT_API_KEY and WEB_EXT_API_SECRET)",
		)
		.option(
			"--url",
			"Print the download URL of the latest signed Firefox build, read from the update manifest on main",
		)
		.action(async (options: { sign?: boolean; url?: boolean }) => {
			const { extension } = await import("./extension/extension");
			const { printExtensionUrl } =
				await import("./extension/printExtensionUrl");
			const { signExtension } = await import("./extension/signExtension");
			if (options.url) return printExtensionUrl();
			return options.sign ? signExtension() : extension();
		});
}
