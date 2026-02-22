import { execSync } from "node:child_process";
import { minimatch } from "minimatch";
import { loadConfig } from "../../shared/loadConfig";

const pattern = "0x[0-9a-fA-F]{6}|#[0-9a-fA-F]{3,6}";

export function hardcodedColors(): void {
	const ignoreGlobs = loadConfig().hardcodedColors?.ignore ?? [];

	try {
		const output = execSync(`grep -rEnH '${pattern}' src/`, {
			encoding: "utf-8",
		});

		const lines = output
			.trim()
			.split("\n")
			.filter((line) => {
				const match = line.match(/^(.+?):\d+:/);
				if (!match) return true;
				const file = match[1];
				return !ignoreGlobs.some((glob) => minimatch(file, glob));
			});

		if (lines.length === 0) {
			console.log("No hardcoded colors found.");
			process.exit(0);
		}

		console.log("Hardcoded colors found:\n");

		for (const line of lines) {
			const match = line.match(/^(.+):(\d+):(.+)$/);
			if (match) {
				const [, file, lineNum, content] = match;
				const colorMatch = content.match(/0x[0-9a-fA-F]{6}|#[0-9a-fA-F]{3,6}/);
				const color = colorMatch?.[0] ?? "unknown";
				console.log(`${file}:${lineNum} → ${color}`);
			}
		}

		console.log(`\nTotal: ${lines.length} hardcoded color(s)`);
		console.log("\nUse colors from the 'open-color' (oc) library instead.");
		console.log("\nExample fix:");
		console.log("  Before: color: '#228be6'");
		console.log("  After:  color: oc.blue[6]");
		console.log("\nImport open-color with: import oc from 'open-color'");
		process.exit(1);
	} catch {
		console.log("No hardcoded colors found.");
		process.exit(0);
	}
}
