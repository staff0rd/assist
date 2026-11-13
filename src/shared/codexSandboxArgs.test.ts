import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { codexSandboxArgs } from "./codexSandboxArgs";

const home = mkdtempSync(join(tmpdir(), "assist-codex-home-"));

afterEach(() => {
	vi.unstubAllEnvs();
	rmSync(home, { recursive: true, force: true });
});

describe("codexSandboxArgs", () => {
	it("enables network access and makes ~/.assist writable", () => {
		vi.stubEnv("HOME", home);

		expect(codexSandboxArgs()).toEqual([
			"-c",
			"sandbox_workspace_write.network_access=true",
			"--add-dir",
			join(home, ".assist"),
		]);
		expect(existsSync(join(home, ".assist"))).toBe(true);
	});
});
