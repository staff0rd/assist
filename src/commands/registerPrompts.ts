import type { Command } from "commander";
import { internalCommand } from "../shared/internalCommand";
import { lazyAction } from "../shared/lazyAction";

export function registerPrompts(program: Command): void {
	internalCommand(
		program
			.command("prompts")
			.description("Show top denied tool calls by frequency")
			.action(lazyAction(() => import("./prompts/prompts"), "prompts")),
		"/prompts",
	);
}
