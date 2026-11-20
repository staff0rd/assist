import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeRepoConfigCache } from "../../shared/writeRepoConfigCache";
import { formatRunEntry } from "./formatRunEntry";
import { loadSourcedRunConfigs } from "./loadSourcedRunConfigs";

vi.mock("../backlog/getCachedOrigin", () => ({
	getCachedOrigin: () => "github.com/org/assist",
}));

let base: string;
let repo: string;
let globalPath: string;
let projectPath: string;

beforeEach(() => {
	base = mkdtempSync(join(tmpdir(), "run-list-"));
	repo = mkdtempSync(join(base, "repo-"));
	globalPath = join(base, ".assist.yml");
	projectPath = join(repo, "assist.yml");
});

afterEach(() => {
	writeRepoConfigCache({});
	rmSync(base, { recursive: true, force: true });
});

function verboseList(): string {
	return loadSourcedRunConfigs(repo, globalPath)
		.map(({ config, source }) => formatRunEntry(config, source))
		.join("\n");
}

describe("run list --verbose", () => {
	it("prints every set property and the source under each entry", () => {
		writeFileSync(
			globalPath,
			[
				"run:",
				"  - name: serve",
				"    command: pnpm",
				"    args: [dev]",
				"    cwd: web",
				"    env: { NODE_ENV: development, PORT: '3000' }",
				"    server: web",
				"    port: 3000",
				"    protocol: https",
				"    path: /app",
				"    pre: [pnpm install]",
				"    filter: 'src/**'",
				"    quiet: true",
				"    params:",
				"      - name: target",
				"        required: true",
				"        default: local",
				"",
			].join("\n"),
		);
		writeFileSync(projectPath, "run:\n  - name: lint\n    command: oxlint\n");

		expect(verboseList()).toBe(
			[
				"serve: pnpm dev",
				`  source: global (${globalPath})`,
				"  cwd: web",
				"  env: NODE_ENV=development PORT=3000",
				"  server: web",
				"  port: 3000",
				"  protocol: https",
				"  path: /app",
				"  pre: pnpm install",
				"  filter: src/**",
				"  quiet: true",
				"  params: target (required, default local)",
				"lint: oxlint",
				`  source: project (${projectPath})`,
			].join("\n"),
		);
	});

	it("lists only the project entry when it hides a global one of the same name", () => {
		writeFileSync(
			globalPath,
			"run:\n  - name: build\n    command: npm\n    args: [run, build]\n    cwd: old\n",
		);
		writeFileSync(
			projectPath,
			"run:\n  - name: build\n    command: pnpm\n    args: [build]\n",
		);

		expect(verboseList()).toBe(
			["build: pnpm build", `  source: project (${projectPath})`].join("\n"),
		);
	});

	it("labels an entry from the repo's shared-db override", () => {
		writeFileSync(globalPath, "run:\n  - name: test\n    command: npm\n");
		writeRepoConfigCache({
			"org/assist": {
				run: [{ name: "test", command: "pnpm", args: ["test"], port: 5173 }],
			},
		});

		expect(verboseList()).toBe(
			[
				"test: pnpm test",
				"  source: repo override (shared db)",
				"  port: 5173",
			].join("\n"),
		);
	});
});
