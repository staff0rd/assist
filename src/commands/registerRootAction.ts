import type { Command } from "commander";

export function registerRootAction(program: Command): void {
	program
		.option("--no-open", "Do not open a browser on startup")
		.action(async (options) =>
			(await import("./sessions/web")).web({
				port: "3100",
				open: options.open,
			}),
		);
}
