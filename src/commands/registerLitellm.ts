import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { listModels } from "./litellm/listModels";
import { litellmConfigHelp } from "./litellm/litellmConfigHelp";

export function registerLitellm(program: Command): void {
	const cmd = program.command("litellm").description("LiteLLM proxy utilities");

	const listModelsCommand = cmd
		.command("list-models")
		.description("List the models the configured LiteLLM proxy serves")
		.option("--json", "Output the raw /v1/models response body")
		.action((options: { json?: boolean }) => listModels(options));

	configHelp(listModelsCommand, litellmConfigHelp);
}
