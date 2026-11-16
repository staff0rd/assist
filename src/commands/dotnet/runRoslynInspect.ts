import { execFileSync, spawnSync } from "node:child_process";
import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import { runConfigBaseDir } from "../../shared/runConfigBaseDir";
import type { Issue } from "./parseInspectReport";

function resolveMsbuildPath(): string {
	const { run } = loadConfig();
	const configs = resolveRunConfigs(run, runConfigBaseDir());
	const buildConfig = configs.find((r) => r.name === "build");
	return buildConfig?.command ?? "msbuild";
}

export function assertMsbuildInstalled(): void {
	const msbuild = resolveMsbuildPath();
	try {
		execFileSync(msbuild, ["-version"], { stdio: "pipe" });
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
	const result = spawnSync(
		msbuild,
		[
			slnPath,
			"-t:Build",
			"-v:minimal",
			"-maxcpucount",
			"-p:EnforceCodeStyleInBuild=true",
			"-p:RunAnalyzersDuringBuild=true",
		],
		{ encoding: "utf8", stdio: "pipe", maxBuffer: 50 * 1024 * 1024 },
	);
	return parseMsbuildOutput(`${result.stdout ?? ""}${result.stderr ?? ""}`);
}
