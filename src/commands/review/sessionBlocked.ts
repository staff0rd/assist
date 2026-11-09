import chalk from "chalk";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { launchBlocker } from "../../shared/harnessAdapters/launchBlocker";
import type { ReviewOptions } from "./ReviewOptions";
import { reviewSessionFeature } from "./reviewSessionFeature";

export function sessionBlocked(options: ReviewOptions): boolean {
	const feature = reviewSessionFeature(options);
	if (!feature) return false;
	const blocker = launchBlocker(harnessAdapter(options.harness), feature);
	if (!blocker) return false;
	console.error(chalk.red(blocker));
	process.exitCode = 1;
	return true;
}
