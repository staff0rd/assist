import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const root = join(tmpdir(), "assist-get-config-test");
const home = join(root, "home");
const repo = join(root, "repo");

const mockRespondJson = vi.fn();

vi.mock("../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

vi.mock("../../../shared/loadConfigFrom", async (importOriginal) => {
	const actual = (await importOriginal()) as Record<string, unknown>;
	return {
		...actual,
		getGlobalConfigPath: () => join(root, "home", ".assist.yml"),
	};
});

import type { ConfigEntry } from "../../config/readConfigEntries";
import { getConfig } from "./getConfig";

mkdirSync(repo, { recursive: true });
mkdirSync(home, { recursive: true });

afterAll(() => {
	vi.unstubAllEnvs();
	rmSync(root, { recursive: true, force: true });
});

function get(cwd: string): ConfigEntry[] {
	const req = { url: `/api/config?cwd=${encodeURIComponent(cwd)}` };
	getConfig(req as IncomingMessage, {} as ServerResponse);
	const [, status, payload] = mockRespondJson.mock.lastCall as [
		ServerResponse,
		number,
		ConfigEntry[],
	];
	expect(status).toBe(200);
	return payload;
}

function entryFor(entries: ConfigEntry[], key: string): ConfigEntry {
	const entry = entries.find((candidate) => candidate.key === key);
	if (!entry) throw new Error(`no entry for ${key}`);
	return entry;
}

describe("getConfig", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv("HOME", home);
		writeFileSync(join(home, ".assist.yml"), "commit:\n  pull: false\n");
		writeFileSync(
			join(repo, "assist.yml"),
			"run:\n  - name: build\n    command: pnpm build\n",
		);
	});

	it("reads the project config at the cwd", () => {
		const entry = entryFor(get(repo), "run");

		expect(entry.source).toBe("project");
		expect(entry.value).toEqual([{ name: "build", command: "pnpm build" }]);
	});
});
