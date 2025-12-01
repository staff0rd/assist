import { execSync } from "node:child_process";
import chalk from "chalk";

const MIN_LINES = 50;
const MAX_ABSOLUTE_LINES = 35;
const EXTENSIONS = [".ts", ".tsx"];

type FileGrowthError = {
	filePath: string;
	originalLines: number;
	currentLines: number;
	increase: string;
};

function getMaxPercentage(): number {
	const maxPercentageArg = process.argv.find(
		(arg) => arg.startsWith("--max-percentage=") || !Number.isNaN(Number(arg)),
	);

	if (maxPercentageArg?.startsWith("--max-percentage=")) {
		return Number(maxPercentageArg.split("=")[1]);
	}

	if (maxPercentageArg && !Number.isNaN(Number(maxPercentageArg))) {
		return Number(maxPercentageArg);
	}

	return 40;
}

function getChangedFiles(): string[] {
	try {
		const output = execSync("git diff --name-only", { encoding: "utf-8" });
		return output
			.trim()
			.split("\n")
			.filter((file) => EXTENSIONS.some((ext) => file.endsWith(ext)));
	} catch {
		return [];
	}
}

function getOriginalLineCount(filePath: string): number {
	try {
		const content = execSync(`git show HEAD:${filePath}`, {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		return content.split("\n").length;
	} catch {
		return 0;
	}
}

function getCurrentLineCount(filePath: string): number {
	try {
		const content = execSync(`cat "${filePath}"`, { encoding: "utf-8" });
		return content.split("\n").length;
	} catch {
		return 0;
	}
}

export function runFileGrowthCheck(): boolean {
	const verbose = process.argv.includes("-v");
	const MAX_PERCENTAGE = getMaxPercentage();
	const changedFiles = getChangedFiles();
	const errors: FileGrowthError[] = [];

	if (verbose) {
		console.log(chalk.bold("\nChanged files:\n"));
	}

	for (const filePath of changedFiles) {
		const originalLines = getOriginalLineCount(filePath);

		if (originalLines < MIN_LINES) {
			if (verbose) {
				console.log(chalk.gray(`  ${filePath} (small)`));
			}
			continue;
		}

		const currentLines = getCurrentLineCount(filePath);
		const absoluteIncrease = currentLines - originalLines;
		const percentageIncrease = (absoluteIncrease / originalLines) * 100;

		const exceedsThreshold =
			percentageIncrease > MAX_PERCENTAGE ||
			absoluteIncrease > MAX_ABSOLUTE_LINES;

		if (verbose) {
			const sign = absoluteIncrease >= 0 ? "+" : "";
			const color = exceedsThreshold ? chalk.red : chalk.green;
			console.log(
				color(
					`  ${filePath}: ${originalLines} → ${currentLines} lines (${sign}${absoluteIncrease} lines, ${sign}${percentageIncrease.toFixed(1)}%)`,
				),
			);
		}

		if (exceedsThreshold) {
			errors.push({
				filePath,
				originalLines,
				currentLines,
				increase: percentageIncrease.toFixed(1),
			});
		}
	}

	if (errors.length > 0) {
		console.error(chalk.red("\nFile growth check failed:\n"));
		for (const error of errors) {
			const absoluteIncrease = error.currentLines - error.originalLines;
			console.error(
				chalk.red(
					`  ${error.filePath}: increased from ${error.originalLines} to ${error.currentLines} lines (+${absoluteIncrease} lines, +${error.increase}%)`,
				),
			);
			console.error(
				chalk.red(
					`    Exceeds thresholds: ${MAX_PERCENTAGE}% OR ${MAX_ABSOLUTE_LINES} lines. Consider refactoring into smaller files.\n`,
				),
			);
		}
		return false;
	}

	if (!process.env.CLAUDECODE) {
		console.log(
			`File growth check passed. No files exceeded ${MAX_PERCENTAGE}% OR ${MAX_ABSOLUTE_LINES} line thresholds.`,
		);
	}
	return true;
}
