import { resolveRepoRoot } from "../resolveRepoRoot";
import { bringUpInstance } from "./bringUpInstance";
import { createInstanceTeardown } from "./createInstanceTeardown";
import { exitWithError } from "./exitWithError";
import { planReviewInstance } from "./planReviewInstance";
import { printKeptInstance } from "./printKeptInstance";
import { requireInstanceConfig } from "./requireInstanceConfig";
import { resolvePrHead } from "./resolvePrHead";
import { runInheritedCommand } from "./runInheritedCommand";
import { loadManualTesting } from "./steps/loadManualTesting";
import { runInstanceSteps } from "./steps/runInstanceSteps";
import { watchInterrupt } from "./watchInterrupt";

export async function reviewInstance(
	pr: string,
	options: { keep?: boolean; headed?: boolean },
): Promise<void> {
	const head = resolvePrHead(pr);
	const config = requireInstanceConfig();
	const manualTesting = loadManualTesting(head);
	const instance = await planReviewInstance({
		config,
		repoRoot: resolveRepoRoot(),
		repo: head.repo,
		prNumber: head.number,
	}).catch((error: Error) => exitWithError(error.message));
	const teardown = createInstanceTeardown(instance, runInheritedCommand);
	const interrupt = watchInterrupt();
	try {
		await bringUpInstance(
			runInheritedCommand,
			instance,
			head,
			() => interrupt.interrupted,
		);
		console.log(
			`PR #${head.number} (${head.sha.slice(0, 7)}) is up as ${instance.project}: ${instance.url}`,
		);
		await runInstanceSteps({
			instance,
			manualTesting,
			logs: config.logs,
			abort: interrupt.abort,
			headed: options.headed,
		});
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exitCode = 1;
	} finally {
		if (options.keep) printKeptInstance(instance);
		else await teardown();
		interrupt.dispose();
	}
}
