import chalk from "chalk";
import { forwardPinConfirm } from "../notify/forwardPinConfirm";
import { approveDocsUnlock } from "./approveDocsUnlock";

export async function docsConfirm(pin: string): Promise<void> {
	const result =
		(await approveDocsUnlock(pin)) ?? (await forwardPinConfirm("docs", pin));
	if (!result) {
		console.error(chalk.red(`No pending docs unlock for pin: ${pin}`));
		process.exitCode = 1;
		return;
	}
	if (result.ok) {
		console.log(chalk.green(result.message));
		return;
	}
	console.error(chalk.red(result.message));
	process.exitCode = 1;
}
