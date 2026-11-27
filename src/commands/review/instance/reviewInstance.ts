import { bringUpInstance } from "./bringUpInstance";
import { formatCheckouts } from "./checkouts/formatCheckouts";
import { createInstanceTeardown } from "./createInstanceTeardown";
import { prepareReviewInstance } from "./prepareReviewInstance";
import { printKeptInstance } from "./printKeptInstance";
import { runInheritedCommand } from "./runInheritedCommand";
import { runInstanceSteps } from "./steps/runInstanceSteps";
import { watchInterrupt } from "./watchInterrupt";

export async function reviewInstance(
	pr: string,
	options: { keep?: boolean; headed?: boolean },
): Promise<void> {
	const { head, config, manualTesting, auth, instance } =
		await prepareReviewInstance(pr);
	const teardown = createInstanceTeardown(instance, runInheritedCommand);
	const interrupt = watchInterrupt();
	try {
		await bringUpInstance(
			runInheritedCommand,
			instance,
			() => interrupt.interrupted,
		);
		console.log(
			`PR #${head.number} (${head.sha.slice(0, 7)}) is up as ${instance.project}: ${instance.url}\n${formatCheckouts(instance.checkouts)}`,
		);
		await runInstanceSteps({
			instance,
			manualTesting,
			logs: config.logs,
			abort: interrupt.abort,
			headed: options.headed,
			auth,
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
