import chalk from "chalk";

const MI_FORMULA =
	"171 - 5.2*ln(HalsteadVolume) - 0.23*CyclomaticComplexity - 16.2*ln(SLOC), clamped 0-100";

export function printMaintainabilityFormula(): void {
	console.log(chalk.dim(MI_FORMULA));
}
