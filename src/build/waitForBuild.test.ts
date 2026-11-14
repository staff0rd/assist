import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildLockPath } from "./buildLockPath";
import { waitForBuild } from "./waitForBuild";

vi.unmock("./waitForBuild");

let installDir: string;
const lock = () => buildLockPath(installDir);

beforeEach(() => {
	installDir = mkdtempSync(join(tmpdir(), "wait-for-build-"));
});

afterEach(() => {
	rmSync(installDir, { recursive: true, force: true });
});

describe("waitForBuild", () => {
	it("returns at once when no build holds the lock", async () => {
		const log = vi.fn();

		await waitForBuild({ installDir, log });

		expect(log).not.toHaveBeenCalled();
	});

	it("ignores a lock left by a builder that is no longer running", async () => {
		writeFileSync(lock(), "2147483646");
		const log = vi.fn();

		await waitForBuild({ installDir, log, timeoutMs: 1_000 });

		expect(log).not.toHaveBeenCalled();
	});

	it("waits until a live builder releases the lock", async () => {
		writeFileSync(lock(), String(process.pid));
		const log = vi.fn();
		setTimeout(() => rmSync(lock()), 50);

		await waitForBuild({ installDir, log, pollMs: 10, timeoutMs: 5_000 });

		expect(log).toHaveBeenLastCalledWith("build finished; continuing");
	});

	it("gives up and continues once the timeout passes", async () => {
		writeFileSync(lock(), String(process.pid));
		const log = vi.fn();

		await waitForBuild({ installDir, log, pollMs: 10, timeoutMs: 30 });

		expect(log).toHaveBeenLastCalledWith(
			"build still running after 0.03s; continuing anyway",
		);
	});
});
