import chalk from "chalk";
import { foreignOriginError } from "./foreignOriginError";
import { getOrigin } from "./shared";
import type { BacklogItem } from "./types";

export function refuseForeignOrigin(item: BacklogItem): boolean {
	const foreign = foreignOriginError(item, getOrigin());
	if (!foreign) return false;
	console.error(chalk.red(foreign));
	process.exitCode = 1;
	return true;
}
