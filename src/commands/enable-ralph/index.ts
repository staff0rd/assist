import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { promptConfirm } from "../../shared/promptConfirm";
import { printDiff } from "../../utils/printDiff";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>,
): Record<string, unknown> {
	const result = { ...target };
	for (const key of Object.keys(source)) {
		const sourceVal = source[key];
		const targetVal = result[key];
		if (
			sourceVal &&
			typeof sourceVal === "object" &&
			!Array.isArray(sourceVal) &&
			targetVal &&
			typeof targetVal === "object" &&
			!Array.isArray(targetVal)
		) {
			result[key] = deepMerge(
				targetVal as Record<string, unknown>,
				sourceVal as Record<string, unknown>,
			);
		} else {
			result[key] = sourceVal;
		}
	}
	return result;
}

export async function enableRalph(): Promise<void> {
	const sourcePath = path.join(
		__dirname,
		"commands/enable-ralph/settings.local.json",
	);
	const targetPath = path.join(process.cwd(), ".claude/settings.local.json");
	const sourceData = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

	const targetDir = path.dirname(targetPath);
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
	}

	let targetData: Record<string, unknown> = {};
	let targetContent = "{}";
	if (fs.existsSync(targetPath)) {
		targetContent = fs.readFileSync(targetPath, "utf-8");
		targetData = JSON.parse(targetContent);
	}

	const merged = deepMerge(targetData, sourceData);
	const mergedContent = JSON.stringify(merged, null, "\t") + "\n";

	if (mergedContent === targetContent) {
		console.log(chalk.green("settings.local.json already has ralph enabled"));
		return;
	}

	console.log(chalk.yellow("\nChanges to settings.local.json:"));
	console.log();
	printDiff(targetContent, mergedContent);

	const confirm = await promptConfirm("Apply these changes?");

	if (!confirm) {
		console.log("Skipped");
		return;
	}

	fs.writeFileSync(targetPath, mergedContent);
	console.log(`Updated ${targetPath}`);
}
