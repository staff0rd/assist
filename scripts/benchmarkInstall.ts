import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Tool = {
	name: string;
	install: string[];
};

const INSTALL_PATHS = [".", "docs"];

const TOOLS: Tool[] = [
	{ name: "npm", install: ["npm", "ci", "--no-audit", "--no-fund"] },
];

function parseRuns(argv: string[]): number {
	const index = argv.indexOf("--runs");
	if (index === -1) return 3;
	const runs = Number(argv[index + 1]);
	if (!Number.isInteger(runs) || runs < 1) {
		throw new Error(
			`--runs must be a positive integer, got "${argv[index + 1]}"`,
		);
	}
	return runs;
}

function checkoutHead(): string {
	const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
		encoding: "utf8",
	}).trim();
	const dir = mkdtempSync(join(tmpdir(), "assist-bench-install-"));
	execFileSync("sh", [
		"-c",
		`git -C "${repoRoot}" archive HEAD | tar -x -C "${dir}"`,
	]);
	return dir;
}

function clearNodeModules(treeDir: string): void {
	for (const path of INSTALL_PATHS) {
		rmSync(join(treeDir, path, "node_modules"), {
			recursive: true,
			force: true,
		});
	}
}

function install(tool: Tool, cwd: string): number {
	const [command, ...args] = tool.install;
	const start = performance.now();
	const result = spawnSync(command, args, {
		cwd,
		stdio: ["ignore", "ignore", "pipe"],
		encoding: "utf8",
	});
	const elapsed = performance.now() - start;
	if (result.status !== 0) {
		throw new Error(
			`${tool.install.join(" ")} failed in ${cwd}:\n${result.stderr}`,
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

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

type Result = { tool: string; path: string; times: number[]; size: string };

function benchmarkTool(tool: Tool, treeDir: string, runs: number): Result[] {
	console.log(`${tool.name}: warm-up install`);
	clearNodeModules(treeDir);
	for (const path of INSTALL_PATHS) install(tool, join(treeDir, path));

	const times: Record<string, number[]> = Object.fromEntries(
		INSTALL_PATHS.map((path) => [path, []]),
	);
	for (let run = 1; run <= runs; run++) {
		clearNodeModules(treeDir);
		for (const path of INSTALL_PATHS) {
			const elapsed = install(tool, join(treeDir, path));
			times[path].push(elapsed);
			console.log(
				`${tool.name}: run ${run}/${runs} ${path} ${seconds(elapsed)}`,
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

function main(): void {
	const runs = parseRuns(process.argv.slice(2));
	const treeDir = checkoutHead();
	console.log(
		`Fresh checkout of HEAD in ${treeDir}, ${runs} timed runs per tool`,
	);
	try {
		const results = TOOLS.flatMap((tool) => benchmarkTool(tool, treeDir, runs));
		printResults(results);
	} finally {
		rmSync(treeDir, { recursive: true, force: true });
	}
}

main();
