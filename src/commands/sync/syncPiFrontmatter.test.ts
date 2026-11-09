import { readdirSync, readFileSync } from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { commandToPrompt } from "./syncPi";
import { splitFrontmatter } from "./splitFrontmatter";

const commandsDir = path.resolve("claude/commands");
const commands = readdirSync(commandsDir).filter((f) => f.endsWith(".md"));

function frontmatterOf(prompt: string): unknown {
	const match = prompt.match(/^---\n([\s\S]*?)\n---\n/);
	if (!match) throw new Error("prompt has no frontmatter");
	return parse(match[1]);
}

function allowedArgs(source: string): string | undefined {
	const value = parse(splitFrontmatter(source).frontmatter)?.allowed_args;
	return typeof value === "string" ? value : undefined;
}

describe("pi prompt frontmatter for every synced command", () => {
	it.each(commands)(
		"%s parses as YAML with its description and argument hint as plain strings",
		(file) => {
			const name = file.replace(/\.md$/, "");
			const source = readFileSync(path.join(commandsDir, file), "utf8");
			const parsed = frontmatterOf(commandToPrompt(name, source));

			const hint = allowedArgs(source);
			expect(parsed).toEqual({
				description: splitFrontmatter(source).description ?? name,
				...(hint ? { "argument-hint": hint } : {}),
			});
		},
	);

	it("keeps bracketed hints as one string rather than a YAML list", () => {
		const prompt = commandToPrompt(
			"jira",
			'---\ndescription: d\nallowed_args: "[action] [JIRA-KEY] [args]"\n---\nbody',
		);

		expect(frontmatterOf(prompt)).toEqual({
			description: "d",
			"argument-hint": "[action] [JIRA-KEY] [args]",
		});
	});
});
