import type { Command } from "commander";
import { prompts } from "./prompts/prompts";

export function registerPrompts(program: Command): void {
	program
		.command("prompts")
		.description("Show top denied tool calls by frequency")
		.action(prompts);
}
