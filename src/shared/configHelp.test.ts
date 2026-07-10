import { Command } from "commander";
import { describe, expect, it } from "vitest";
import {
	configHelp,
	getDocumentedConfigKeys,
	renderConfigHelp,
} from "./configHelp";

describe("renderConfigHelp", () => {
	it("aligns the note column and prefixes a Config header", () => {
		const output = renderConfigHelp([
			{ key: "a.short", setter: "assist config set a.short x", note: "first" },
			{
				key: "a.longer",
				setter: "assist config set a.longer value",
				note: "second",
			},
		]);
		const lines = output.split("\n");
		expect(lines[0]).toBe("");
		expect(lines[1]).toBe("Config:");
		const hashColumns = lines
			.filter((line) => line.includes("#"))
			.map((line) => line.indexOf("#"));
		expect(hashColumns).toHaveLength(2);
		expect(new Set(hashColumns).size).toBe(1);
		expect(output).toContain("assist config set a.short x");
		expect(output).toContain("# second");
	});

	it("includes the preamble followed by a blank line", () => {
		const output = renderConfigHelp(
			[{ key: "a.b", setter: "assist config set a.b x", note: "note" }],
			"Preamble text.",
		);
		expect(output).toBe(
			[
				"",
				"Preamble text.",
				"",
				"Config:",
				"  assist config set a.b x # note",
			].join("\n"),
		);
	});
});

describe("configHelp", () => {
	it("records declared keys and appends the block to --help", () => {
		const command = new Command("demo");
		configHelp(command, [
			{
				key: "demo.uniqueKey",
				setter: "assist config set demo.uniqueKey x",
				note: "a note",
			},
		]);
		expect(getDocumentedConfigKeys().has("demo.uniqueKey")).toBe(true);

		let out = "";
		command.configureOutput({ writeOut: (text) => (out += text) });
		command.outputHelp();
		expect(out).toContain("Config:");
		expect(out).toContain("assist config set demo.uniqueKey x # a note");
	});
});
