import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { releasesConfigHelp } from "./releases/releasesConfigHelp";
import { releasesList } from "./releases/releasesList";

export function registerReleases(parent: Command): void {
	const releasesCommand = parent
		.command("releases")
		.description("Inspect the declared release promotion streams")
		.action(releasesList);

	configHelp(
		releasesCommand,
		releasesConfigHelp,
		"Streams are declared by hand in assist.yml and rendered by the /releases page of the sessions dashboard.",
	);

	releasesCommand
		.command("list")
		.description("List the declared release streams, their nodes and edges")
		.action(releasesList);
}
