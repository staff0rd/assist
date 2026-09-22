import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { releasesConfigHelp } from "./releases/releasesConfigHelp";
import { releasesConfigure } from "./releases/releasesConfigure";
import { releasesList } from "./releases/releasesList";

export function registerReleases(parent: Command): void {
	const releasesCommand = parent
		.command("releases")
		.description("Inspect the declared release promotion streams")
		.action(releasesList);

	configHelp(
		releasesCommand,
		releasesConfigHelp,
		"Streams are declared by '/releases-configure', which derives them from the repo's workflows and writes them with 'assist releases configure', and rendered by the /releases page of the sessions dashboard.",
	);

	releasesCommand
		.command("list")
		.description("List the declared release streams, their nodes and edges")
		.action(releasesList);

	releasesCommand
		.command("configure")
		.description(
			"Validate release streams and write them to releases.streams for the current repo",
		)
		.requiredOption(
			"--streams <file>",
			"JSON or YAML array of streams to declare; '-' reads stdin",
		)
		.option(
			"--scope <project|repo>",
			"project assist.yml or ~/.assist.yml repo block",
			"project",
		)
		.action(releasesConfigure);
}
