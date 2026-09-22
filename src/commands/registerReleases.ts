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
		"Streams are declared by 'assist releases configure <owner/repo>' or by hand in assist.yml, and rendered by the /releases page of the sessions dashboard.",
	);

	releasesCommand
		.command("list")
		.description("List the declared release streams, their nodes and edges")
		.action(releasesList);

	releasesCommand
		.command("configure <owner/repo>")
		.description(
			"Derive a repo's promotion topology with Claude and write it to releases.streams",
		)
		.action(releasesConfigure);
}
