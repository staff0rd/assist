import chalk from "chalk";
import { awaitClaude } from "../../shared/awaitClaude";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
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
	const { done } = harnessAdapter(spawnOptions?.harness).resume(
		resumeSessionId,
		"",
		{ cwd: process.cwd(), allowEdits: spawnOptions?.allowEdits ?? true },
	);
	return (await awaitClaude(done, label)) === 0;
}
