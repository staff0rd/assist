import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Tool = {
	name: string;
	installHint: string;
	prepare?: (dir: string) => void;
	install: string[];
};

function readJson(path: string) {
	return JSON.parse(readFileSync(path, "utf8"));
}

function installScriptPackages(dir: string): string[] {
	const { packages } = readJson(join(dir, "package-lock.json")) as {
		packages: Record<string, { hasInstallScript?: boolean }>;
	};
	const names = Object.entries(packages)
		.filter(([key, entry]) => key && entry.hasInstallScript)
		.map(([key]) => key.split("node_modules/").at(-1) as string);
	return [...new Set(names)];
}

function allowNpmBuildsAndOverridesForPnpm(dir: string): void {
	const overrides: Record<string, string> =
		readJson(join(dir, "package.json")).overrides ?? {};
	const lines = ["dangerouslyAllowAllBuilds: true", "overrides:"];
	for (const [name, spec] of Object.entries(overrides)) {
		lines.push(`  ${JSON.stringify(name)}: ${JSON.stringify(spec)}`);
	}
	writeFileSync(join(dir, "pnpm-workspace.yaml"), `${lines.join("\n")}\n`);
}

function preparePnpm(dir: string): void {
	allowNpmBuildsAndOverridesForPnpm(dir);
	run(["pnpm", "import"], dir);
}

function prepareBun(dir: string): void {
	const packageJsonPath = join(dir, "package.json");
	const packageJson = readJson(packageJsonPath);
	packageJson.trustedDependencies = installScriptPackages(dir);
	writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
	run(["bun", "install", "--lockfile-only"], dir);
}

const INSTALL_PATHS = [".", "docs"];

const TOOLS: Tool[] = [
	{
		name: "npm",
		installHint: "npm ships with Node.js: https://nodejs.org/",
		install: ["npm", "ci", "--no-audit", "--no-fund"],
	},
	{
		name: "pnpm",
		installHint: "npm install -g pnpm (or: corepack enable pnpm)",
		prepare: preparePnpm,
		install: ["pnpm", "install", "--frozen-lockfile"],
	},
	{
		name: "bun",
		installHint:
			"npm install -g bun (or: curl -fsSL https://bun.sh/install | bash)",
		prepare: prepareBun,
		install: ["bun", "install", "--frozen-lockfile"],
	},
];

function flagValue(argv: string[], flag: string): string | undefined {
	const index = argv.indexOf(flag);
	return index === -1 ? undefined : argv[index + 1];
}

function parseRuns(argv: string[]): number {
	const value = flagValue(argv, "--runs");
	if (value === undefined) return 3;
	const runs = Number(value);
	if (!Number.isInteger(runs) || runs < 1) {
		throw new Error(`--runs must be a positive integer, got "${value}"`);
	}
	return runs;
}

function parseTools(argv: string[]): Tool[] {
	const value = flagValue(argv, "--tools");
	if (value === undefined) return TOOLS;
	return value.split(",").map((name) => {
		const tool = TOOLS.find((t) => t.name === name.trim());
		if (!tool) {
			throw new Error(
				`Unknown tool "${name}" in --tools; choose from ${TOOLS.map((t) => t.name).join(", ")}`,
			);
		}
		return tool;
	});
}

function isInstalled(tool: Tool): boolean {
	return !spawnSync(tool.name, ["--version"], { stdio: "ignore" }).error;
}

function checkoutHead(dir: string): void {
	const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
		encoding: "utf8",
	}).trim();
	execFileSync("bash", [
		"-c",
		`set -o pipefail; git -C "${repoRoot}" archive HEAD | tar -x -C "${dir}"`,
	]);
}

function clearNodeModules(treeDir: string): void {
	for (const path of INSTALL_PATHS) {
		rmSync(join(treeDir, path, "node_modules"), {
			recursive: true,
			force: true,
		});
	}
}

function run(commandLine: string[], cwd: string): number {
	const [command, ...args] = commandLine;
	const start = performance.now();
	const result = spawnSync(command, args, {
		cwd,
		stdio: ["ignore", "ignore", "pipe"],
		encoding: "utf8",
	});
	const elapsed = performance.now() - start;
	if (result.status !== 0) {
		throw new Error(
			`${commandLine.join(" ")} failed in ${cwd}:\n${result.stderr}`,
		);
	}
	return elapsed;
}

function nodeModulesSize(dir: string): string {
	return execFileSync("du", ["-sh", join(dir, "node_modules")], {
		encoding: "utf8",
	}).split("\t")[0];
}

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const seconds = (ms: number) => `${(ms / 1000).toFixed(2)}s`;

type Result = { tool: string; path: string; times: number[]; size: string };

function benchmarkTool(tool: Tool, treeDir: string, runs: number): Result[] {
	if (tool.prepare) {
		console.log(`${tool.name}: generating lockfiles from package-lock.json`);
		for (const path of INSTALL_PATHS) tool.prepare(join(treeDir, path));
	}
	console.log(`${tool.name}: warm-up install`);
	clearNodeModules(treeDir);
	for (const path of INSTALL_PATHS) run(tool.install, join(treeDir, path));

	const times: Record<string, number[]> = Object.fromEntries(
		INSTALL_PATHS.map((path) => [path, []]),
	);
	for (let attempt = 1; attempt <= runs; attempt++) {
		clearNodeModules(treeDir);
		for (const path of INSTALL_PATHS) {
			const elapsed = run(tool.install, join(treeDir, path));
			times[path].push(elapsed);
			console.log(
				`${tool.name}: run ${attempt}/${runs} ${path} ${seconds(elapsed)}`,
			);
		}
	}

	return INSTALL_PATHS.map((path) => ({
		tool: tool.name,
		path,
		times: times[path],
		size: nodeModulesSize(join(treeDir, path)),
	}));
}

function printResults(results: Result[]): void {
	const rows = results.map((r) => ({
		tool: r.tool,
		path: r.path,
		median: seconds(median(r.times)),
		runs: r.times.map(seconds).join(", "),
		node_modules: r.size,
	}));
	console.table(rows);
}

function benchmarkInFreshTree(tool: Tool, runs: number): Result[] {
	const treeDir = mkdtempSync(join(tmpdir(), "assist-bench-install-"));
	try {
		checkoutHead(treeDir);
		console.log(`${tool.name}: fresh checkout of HEAD in ${treeDir}`);
		return benchmarkTool(tool, treeDir, runs);
	} finally {
		rmSync(treeDir, { recursive: true, force: true });
	}
}

function main(): void {
	const argv = process.argv.slice(2);
	const runs = parseRuns(argv);
	const tools = parseTools(argv);
	const missing = tools.filter((tool) => !isInstalled(tool));
	for (const tool of missing) {
		console.warn(
			`${tool.name} not found, skipping. Install it with: ${tool.installHint}`,
		);
	}
	const results = tools
		.filter((tool) => !missing.includes(tool))
		.flatMap((tool) => benchmarkInFreshTree(tool, runs));
	printResults(results);
}

main();
