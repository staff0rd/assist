import type { Command } from "commander";
import { configHelp } from "../../shared/configHelp";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { harnessConfigHelp } from "./harnessConfigHelp";
import { harnessDefaultsConfigHelp } from "./harnessDefaultsConfigHelp";
import { resolveHarness } from "./resolveHarness";
import { run as backlogRun } from "./run";

export function registerRunCommand(cmd: Command): void {
	const command = cmd
		.command("run <id>")
		.description("Run a backlog item's plan phase-by-phase")
		.option("-w, --write", "Run the harness with write access (default)")
		.option("--no-write", "Run the harness without write access")
		.option(
			"--harness <harness>",
			"Coding harness to launch (claude|codex|pi); defaults to the configured harness.defaults.run.harness, then harness.engine",
		)
		.option(
			"--resume-session <id>",
			"Resume an interrupted Claude session for the current phase (used by the sessions daemon on restart)",
		)
		.action(
			async (
				id: string,
				opts: {
					write?: boolean;
					harness?: string;
					resumeSession?: string;
				},
			) => {
				/* why: a daemon restore relaunches with --resume-session to resume an
				 * interrupted phase; pulling would move the working tree out from
				 * under that in-flight conversation, and a pull failure would abort
				 * the restore entirely. Only pull on a fresh run. */
				if (!opts.resumeSession) await pullIfConfigured();
				await backlogRun(id, {
					allowEdits: opts.write !== false,
					harness: resolveHarness(opts.harness, "run"),
					resumeSessionId: opts.resumeSession,
				});
			},
		);
	configHelp(command, [...harnessConfigHelp, ...harnessDefaultsConfigHelp]);
}
