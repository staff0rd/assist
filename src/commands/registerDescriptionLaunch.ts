import type { Command } from "commander";
import type { HarnessFeature } from "../shared/harnessAdapters/types";
import { configHelp } from "../shared/configHelp";
import { harnessConfigHelp } from "./backlog/harnessConfigHelp";
import { launchMode } from "./backlog/launchMode";
import { resolveHarness } from "./backlog/resolveHarness";

const harnessFlag = (feature: HarnessFeature) =>
	`Coding harness to launch (claude|codex|pi); defaults to the configured harness.engine. Exits with the reasons, without launching, when ${feature.label} is unavailable on it`;

type LaunchOpts = { once?: boolean; resumeSession?: string; harness?: string };

export function registerDescriptionLaunch(
	program: Command,
	name: string,
	slashCommand: string,
	description: string,
	feature: HarnessFeature,
	resumeFlag: string,
	alias?: string,
): void {
	const command = program
		.command(name)
		.argument(
			"[description]",
			`Text to forward to the /${slashCommand} slash command`,
		)
		.description(description)
		.option("--once", "Exit when the initial task completes")
		.option("--resume-session <id>", resumeFlag)
		.option("--harness <kind>", harnessFlag(feature))
		.action((text: string | undefined, opts: LaunchOpts) =>
			launchMode(slashCommand, {
				once: opts.once,
				description: text,
				resumeSessionId: opts.resumeSession,
				harness: resolveHarness(opts.harness),
				feature,
			}),
		);
	configHelp(command, harnessConfigHelp);
	if (alias) command.alias(alias);
}
