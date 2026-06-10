import chalk from "chalk";
import {
	type SpawnClaudeOptions,
	withoutResumeSession,
} from "../../shared/spawnClaude";
import { acquireLock, releaseLock } from "./acquireLock";
import { blockedByHandover } from "./blockedByHandover";
import { type PreparedRun, prepareRun } from "./prepareRun";
import { runOnce } from "./runOnce";
import { setStatus } from "./shared";

export async function run(
	id: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	if (blockedByHandover()) return false;

	const prepared = await prepareRun(id);
	if (!prepared) return false;

	await setStatus(id, "in-progress");
	logProgress(id, prepared);
	return runPrepared(id, prepared, spawnOptions);
}

async function runPrepared(
	id: string,
	prepared: PreparedRun,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	const { item } = prepared;
	let { plan, startPhase } = prepared;
	acquireLock(item.id);
	try {
		while (true) {
			const review = await runOnce(item, startPhase, plan, spawnOptions);
			spawnOptions = withoutResumeSession(spawnOptions);
			if (review.kind === "fail") return false;
			if (review.kind === "abort") return false;
			if (review.kind === "rewind") {
				// rewindPhase already set the status to in-progress and rewound the
				// current phase; resume from the rewound phase rather than finishing.
				startPhase = review.targetPhase;
				plan = review.plan;
				continue;
			}
			await ensureDone(id);
			return true;
		}
	} finally {
		releaseLock(item.id);
	}
}

function logProgress(
	id: string,
	{ plan, startPhase, item }: PreparedRun,
): void {
	console.log(chalk.bold(`Running plan for #${id}: ${item.name}`));
	// why: +1 for the review phase appended after the authored phases, so resuming at the review reads e.g. 2/2 rather than 2/1.
	const totalPhases = plan.length + 1;
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(
			chalk.dim(`Resuming from phase ${phaseNumber}/${totalPhases}\n`),
		);
	} else {
		console.log(chalk.dim(`${totalPhases} phase(s)\n`));
	}
}

async function ensureDone(id: string): Promise<void> {
	try {
		await setStatus(id, "done");
	} catch {
		// Item may already be marked done by the review agent — ignore
	}
}
