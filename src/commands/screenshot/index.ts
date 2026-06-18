import { execSync } from "node:child_process";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { captureWindowPs1 } from "./captureWindowPs1";

function buildOutputPath(outputDir: string, processName: string): string {
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	return resolve(outputDir, `${processName}-${timestamp}.png`);
}

function runPowerShellScript(processName: string, outputPath: string): void {
	const scriptPath = join(tmpdir(), `assist-screenshot-${Date.now()}.ps1`);
	writeFileSync(scriptPath, captureWindowPs1, "utf8");
	try {
		execSync(
			`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}" -ProcessName "${processName}" -OutputPath "${outputPath}"`,
			{ stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" },
		);
	} finally {
		unlinkSync(scriptPath);
	}
}

export function screenshot(processName: string): void {
	const config = loadConfig();
	const outputDir = resolve(config.screenshot.outputDir);
	const outputPath = buildOutputPath(outputDir, processName);

	console.log(chalk.gray(`Capturing window for process "${processName}" ...`));

	try {
		runPowerShellScript(processName, outputPath);
		console.log(chalk.green(`Screenshot saved: ${outputPath}`));
	} catch (error) {
		const msg = error instanceof Error ? error.message : String(error);
		console.error(chalk.red(`Failed to capture screenshot: ${msg}`));
		process.exit(1);
	}
}
