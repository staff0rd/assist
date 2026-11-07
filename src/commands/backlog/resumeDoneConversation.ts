import chalk from "chalk";
import { awaitClaude } from "../../shared/awaitClaude";
import { spawnHarness } from "../../shared/spawnHarness";
import { formatItemId } from "./formatItemId";
import type { DoneResume } from "./prepareRun";
import type { BacklogRunOptions } from "./types";

export async function resumeDoneConversation(
	{ item, resumeSessionId }: DoneResume,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const label = `${formatItemId(item.id)}: ${item.name}`;
	console.log(chalk.green(`Already done: ${label}`));
	console.log(chalk.dim("Resuming its last conversation\n"));
	const { done } = spawnHarness(spawnOptions?.harness ?? "claude", "", {
		allowEdits: spawnOptions?.allowEdits ?? true,
		resumeSessionId,
		cwd: process.cwd(),
	});
	return (await awaitClaude(done, label)) === 0;
}
