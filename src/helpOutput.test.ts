import type { Command } from "commander";
import { describe, expect, it, vi } from "vitest";
import { createProgram } from "./createProgram";
import { preloadHelpText } from "./shared/lazyHelpText";

vi.mock("./commands/run/formatConfiguredCommands", () => ({
	formatConfiguredCommands: () => "\n<configured commands>",
}));

function commandPath(command: Command): string {
	const names: string[] = [];
	for (let c: Command | null = command; c; c = c.parent)
		names.unshift(c.name());
	return names.join(" ");
}

function collectHelp(command: Command, out: string[]): void {
	let text = "";
	command.configureOutput({
		writeOut: (s) => {
			text += s;
		},
		getOutHelpWidth: () => 100,
	});
	command.outputHelp();
	out.push(`=== ${commandPath(command)} --help\n${text}`);
	for (const sub of command.commands) collectHelp(sub, out);
}

describe("--help output", () => {
	it("is unchanged for every command", async () => {
		const out: string[] = [];
		const program = createProgram();
		await preloadHelpText();
		collectHelp(program, out);
		await expect(out.join("\n")).toMatchFileSnapshot(
			"./__snapshots__/helpOutput.txt",
		);
	});
});
