import chalk from "chalk";

export const autoConfirmHintCommand =
	"assist config set sync.autoConfirm true --node";

export function printAutoConfirmHint(): void {
	console.log(
		chalk.dim(
			`Tip: run \`${autoConfirmHintCommand}\` to overwrite automatically next time`,
		),
	);
	console.log();
}
