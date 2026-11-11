import type { Command } from "commander";
import type { HarnessFeature } from "../shared/harnessAdapters/types";
import { configHelp } from "../shared/configHelp";
import { harnessConfigHelp } from "./backlog/harnessConfigHelp";
import { harnessDefaultsConfigHelp } from "./backlog/harnessDefaultsConfigHelp";
import { launchMode } from "./backlog/launchMode";
import { resolveHarness } from "./backlog/resolveHarness";
import { resolveModel } from "./backlog/resolveModel";

const harnessFlag = (feature: HarnessFeature) =>
	`Coding harness to launch (claude|codex|pi); defaults to the configured harness.defaults.<command>.harness, then harness.engine. Exits with the reasons, without launching, when ${feature.label} is unavailable on it`;

type LaunchOpts = {
	once?: boolean;
	resumeSession?: string;
	harness?: string;
	model?: string | false;
};

export function registerDescriptionLaunch(
	program: Command,
	name: "draft" | "bug",
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
		.option(
			"--model <model>",
			`Model to launch the harness with; defaults to harness.defaults.${name}.model while the ${name} type's harness is used`,
		)
		.option("--no-model", "Launch with the harness's own default model")
		.action((text: string | undefined, opts: LaunchOpts) => {
			const harness = resolveHarness(opts.harness, name);
			return launchMode(slashCommand, {
				once: opts.once,
				description: text,
				resumeSessionId: opts.resumeSession,
				harness,
				model: resolveModel(opts.model, name, harness),
				feature,
			});
		});
	configHelp(command, [...harnessConfigHelp, ...harnessDefaultsConfigHelp]);
	if (alias) command.alias(alias);
}
