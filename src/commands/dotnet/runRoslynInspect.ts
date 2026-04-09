import { execSync } from "node:child_process";
import chalk from "chalk";
import { getConfigDir, loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import type { Issue } from "./parseInspectReport";

function resolveMsbuildPath(): string {
	const { run } = loadConfig();
	const configs = resolveRunConfigs(run, getConfigDir());
	const buildConfig = configs.find((r) => r.name === "build");
	return buildConfig?.command ?? "msbuild";
}

export function assertMsbuildInstalled(): void {
	const msbuild = resolveMsbuildPath();
	try {
		execSync(`"${msbuild}" -version`, { stdio: "pipe" });
	} catch {
		console.error(chalk.red(`msbuild not found at: ${msbuild}`));
		console.error(
			chalk.yellow(
				"Configure it via a 'build' run entry in .claude/assist.yml or add msbuild to PATH.",
			),
		);
		process.exit(1);
	}
}

const DIAG_PATTERN =
	/^(.+?)\((\d+),\d+\):\s+(error|warning)\s+(\S+):\s+(.+?)(?:\s+\[.+\])?$/gm;

function parseMsbuildOutput(output: string): Issue[] {
	const normalized = output.replace(/\r\n/g, "\n");
	return [...normalized.matchAll(DIAG_PATTERN)].map((m) => ({
		file: m[1].replace(/\\/g, "/"),
		line: Number.parseInt(m[2], 10),
		severity: m[3] === "error" ? "ERROR" : "WARNING",
		typeId: m[4],
		message: m[5].trim(),
	}));
}

export function runRoslynInspect(slnPath: string): Issue[] {
	const msbuild = resolveMsbuildPath();
	let output: string;
	try {
		output = execSync(
			`"${msbuild}" "${slnPath}" -t:Build -v:minimal -maxcpucount -p:EnforceCodeStyleInBuild=true -p:RunAnalyzersDuringBuild=true 2>&1`,
			{ encoding: "utf-8", stdio: "pipe", maxBuffer: 50 * 1024 * 1024 },
		);
	} catch (err) {
		const e = err as { stdout?: string };
		output = e.stdout ?? "";
	}
	return parseMsbuildOutput(output);
}
