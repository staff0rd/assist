import type { Command } from "commander";
import {
	bugFeature,
	draftFeature,
} from "../shared/harnessAdapters/harnessFeatures";
import { registerRefineLaunch } from "./backlog/registerRefineLaunch";
import { registerFixConflict } from "./registerFixConflict";
import { registerReviewPrComments } from "./registerReviewPrComments";
import { registerDescriptionLaunch } from "./registerDescriptionLaunch";

const RESUME_SESSION_FLAG =
	"Resume an interrupted harness session by its conversation id (used by the sessions daemon on restart)";

function registerNext(program: Command): void {
	program
		.command("next")
		.argument("[id]", "Backlog item ID to run first")
		.description("Alias for backlog next")
		.option("--once", "Exit after the first completed item run")
		.action(async (id: string | undefined, opts: { once?: boolean }) =>
			(await import("./backlog/next")).next(
				{ allowEdits: true, once: opts.once },
				id,
			),
		);
}

export function registerLaunch(program: Command): void {
	registerNext(program);
	registerDescriptionLaunch(
		program,
		"draft",
		"draft",
		"Launch a coding harness in /draft mode, chain into next on /next signal",
		draftFeature,
		RESUME_SESSION_FLAG,
		"feat",
	);
	registerDescriptionLaunch(
		program,
		"bug",
		"bug",
		"Launch a coding harness in /bug mode, chain into next on /next signal",
		bugFeature,
		RESUME_SESSION_FLAG,
	);
	registerReviewPrComments(program, RESUME_SESSION_FLAG);
	registerFixConflict(program, RESUME_SESSION_FLAG);
	registerRefineLaunch(program, RESUME_SESSION_FLAG);
}
