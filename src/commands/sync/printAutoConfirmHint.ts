import chalk from "chalk";
import { autoConfirmHintCommand } from "./autoConfirmHintCommand";

export function printAutoConfirmHint(): void {
	console.log(
		chalk.dim(
			`Tip: run \`${autoConfirmHintCommand}\` to overwrite automatically next time`,
		),
	);
	console.log();
}
