import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { stringify as stringifyYaml } from "yaml";
import { resolveRunConfigs } from "./resolveRunConfigs";
import type { RunEntry } from "./types";

function writeConfig(dir: string, config: Record<string, unknown>): void {
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "assist.yml"), stringifyYaml(config));
}

let tempDir: string;

beforeEach(() => {
	tempDir = join(tmpdir(), `resolve-run-test-${Date.now()}`);
	mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
	rmSync(tempDir, { recursive: true, force: true });
});

describe("resolveRunConfigs", () => {
	it("returns empty array for undefined entries", () => {
		expect(resolveRunConfigs(undefined, tempDir)).toEqual([]);
	});

	it("returns local commands unchanged", () => {
		const entries: RunEntry[] = [
			{ name: "build", command: "npm run build" },
			{ name: "test", command: "npm test" },
		];
		const result = resolveRunConfigs(entries, tempDir);
		expect(result).toEqual(entries);
	});

	it("resolves linked commands from another project", () => {
		const otherDir = join(tempDir, "other-project");
		writeConfig(otherDir, {
			run: [{ name: "lint", command: "npm run lint" }],
		});

		const entries: RunEntry[] = [
			{ name: "build", command: "npm run build" },
			{ link: "other-project", prefix: "other" },
		];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({ name: "build", command: "npm run build" });
		expect(result[1]).toMatchObject({
			name: "other:lint",
			command: "npm run lint",
		});
		expect(result[1].cwd).toBe("other-project");
	});

	it("applies prefix to linked commands", () => {
		const otherDir = join(tempDir, "other-project");
		writeConfig(otherDir, {
			run: [
				{ name: "build", command: "npm run build" },
				{ name: "test", command: "npm test" },
			],
		});

		const entries: RunEntry[] = [{ link: "other-project", prefix: "other" }];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("other:build");
		expect(result[1].name).toBe("other:test");
	});

	it("resolves linked command cwd relative to linked project", () => {
		const otherDir = join(tempDir, "other-project");
		writeConfig(otherDir, {
			run: [{ name: "build", command: "npm run build", cwd: "packages/app" }],
		});

		const entries: RunEntry[] = [{ link: "other-project", prefix: "other" }];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result[0].cwd).toBe(join("other-project", "packages", "app"));
	});

	it("detects duplicate command names across linked projects", () => {
		const projectA = join(tempDir, "project-a");
		const projectB = join(tempDir, "project-b");
		writeConfig(projectA, {
			run: [{ name: "build", command: "a build" }],
		});
		writeConfig(projectB, {
			run: [{ name: "build", command: "b build" }],
		});

		const entries: RunEntry[] = [
			{ link: "project-a", prefix: "shared" },
			{ link: "project-b", prefix: "shared" },
		];

		expect(() => resolveRunConfigs(entries, tempDir)).toThrow(
			/Duplicate run command names: shared:build/,
		);
	});

	it("resolves links recursively", () => {
		const projectA = join(tempDir, "project-a");
		const projectB = join(tempDir, "project-b");

		writeConfig(projectB, {
			run: [{ name: "deep", command: "echo deep" }],
		});
		writeConfig(projectA, {
			run: [
				{ name: "mid", command: "echo mid" },
				{ link: "../project-b", prefix: "b" },
			],
		});

		const entries: RunEntry[] = [{ link: "project-a", prefix: "a" }];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result).toHaveLength(2);
		expect(result[0].name).toBe("a:mid");
		expect(result[1].name).toBe("a:b:deep");
	});

	it("preserves nested linked command cwd from deeper resolution", () => {
		const projectA = join(tempDir, "project-a");
		const projectB = join(tempDir, "project-b");

		writeConfig(projectB, {
			run: [
				{ name: "deep", command: "echo deep" },
				{ name: "deep-cwd", command: "echo deep", cwd: "sub" },
			],
		});
		writeConfig(projectA, {
			run: [{ link: "../project-b", prefix: "b" }],
		});

		const entries: RunEntry[] = [{ link: "project-a", prefix: "a" }];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result).toHaveLength(2);
		// deep should have cwd = project-b, not project-a
		expect(result[0].cwd).toBe("project-b");
		// deep-cwd should have cwd resolved relative to project-b
		expect(result[1].cwd).toBe(join("project-b", "sub"));
	});

	it("detects circular links", () => {
		const projectA = join(tempDir, "project-a");
		const projectB = join(tempDir, "project-b");

		writeConfig(projectA, {
			run: [{ link: "../project-b", prefix: "b" }],
		});
		writeConfig(projectB, {
			run: [{ link: "../project-a", prefix: "a" }],
		});

		const entries: RunEntry[] = [{ link: "project-a", prefix: "a" }];
		expect(() => resolveRunConfigs(entries, tempDir)).toThrow(
			/Circular link detected/,
		);
	});

	it("throws when linked project has no assist.yml", () => {
		const entries: RunEntry[] = [{ link: "nonexistent", prefix: "x" }];
		expect(() => resolveRunConfigs(entries, tempDir)).toThrow(
			/No assist\.yml found in linked project/,
		);
	});

	it("resolves config from .claude subdirectory", () => {
		const otherDir = join(tempDir, "other-project", ".claude");
		writeConfig(otherDir, {
			run: [{ name: "serve", command: "npm start" }],
		});

		const entries: RunEntry[] = [{ link: "other-project", prefix: "other" }];
		const result = resolveRunConfigs(entries, tempDir);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe("other:serve");
	});
});
