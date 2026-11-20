import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeRepoConfigCache } from "../../shared/writeRepoConfigCache";
import { listRunConfigs } from "./listRunConfigs";

const paths = vi.hoisted(() => ({ global: "" }));

vi.mock("../backlog/getCachedOrigin", () => ({
	getCachedOrigin: () => "github.com/org/assist",
}));

vi.mock("../../shared/loadConfigFrom", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	getGlobalConfigPath: () => paths.global,
}));

let base: string;
let repo: string;
let projectPath: string;

beforeEach(() => {
	base = mkdtempSync(join(tmpdir(), "run-list-json-"));
	repo = mkdtempSync(join(base, "repo-"));
	paths.global = join(base, ".assist.yml");
	projectPath = join(repo, "assist.yml");
	vi.spyOn(process, "cwd").mockReturnValue(repo);
});

afterEach(() => {
	vi.restoreAllMocks();
	writeRepoConfigCache({});
	rmSync(base, { recursive: true, force: true });
});

function captureStdout(): string {
	const write = vi.spyOn(process.stdout, "write").mockReturnValue(true);
	const log = vi
		.spyOn(console, "log")
		.mockImplementation((...args) => write(`${args.join(" ")}\n`));
	listRunConfigs({ json: true });
	log.mockRestore();
	return write.mock.calls.map(([chunk]) => String(chunk)).join("");
}

describe("run list --json", () => {
	it("prints only a JSON array of merged entries with every property and its source", () => {
		writeFileSync(
			paths.global,
			[
				"run:",
				"  - name: serve",
				"    command: pnpm",
				"    args: [dev]",
				"    cwd: web",
				"    env: { PORT: '3000' }",
				"    server: web",
				"    port: 3000",
				"    quiet: true",
				"    params:",
				"      - name: target",
				"        required: true",
				"  - name: build",
				"    command: npm",
				"",
			].join("\n"),
		);
		writeFileSync(projectPath, "run:\n  - name: build\n    command: pnpm\n");
		writeRepoConfigCache({
			"org/assist": { run: [{ name: "test", command: "vitest", port: 5173 }] },
		});

		expect(JSON.parse(captureStdout())).toEqual([
			{
				name: "serve",
				command: "pnpm",
				args: ["dev"],
				cwd: "web",
				env: { PORT: "3000" },
				server: "web",
				port: 3000,
				quiet: true,
				params: [{ name: "target", required: true }],
				source: { kind: "global", path: paths.global },
			},
			{
				name: "test",
				command: "vitest",
				port: 5173,
				source: { kind: "repo", from: "db" },
			},
			{
				name: "build",
				command: "pnpm",
				source: { kind: "project", path: projectPath },
			},
		]);
	});

	it("prints an empty array when no entries are configured", () => {
		expect(JSON.parse(captureStdout())).toEqual([]);
	});
});
