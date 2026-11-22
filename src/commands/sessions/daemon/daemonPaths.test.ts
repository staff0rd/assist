import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { daemonDir } from "./daemonDir";
import { daemonPaths } from "./daemonPaths";

describe("daemonPaths", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("keeps tests off the real daemon by moving every path under the test's ASSIST_DAEMON_DIR", () => {
		const dir = process.env.ASSIST_DAEMON_DIR as string;

		expect(dir.startsWith(tmpdir())).toBe(true);
		expect(daemonPaths.dir).toBe(dir);
		for (const [key, path] of Object.entries(daemonPaths)) {
			if (key === "socket" && process.platform === "win32") continue;
			expect(path.startsWith(dir), key).toBe(true);
		}
	});

	it("reads the daemon dir from ASSIST_DAEMON_DIR", () => {
		vi.stubEnv("ASSIST_DAEMON_DIR", "/elsewhere/daemon");

		expect(daemonDir()).toBe("/elsewhere/daemon");
	});

	it("defaults to ~/.assist/daemon without the override", () => {
		vi.stubEnv("ASSIST_DAEMON_DIR", "");

		expect(daemonDir()).toBe(join(homedir(), ".assist", "daemon"));
	});
});
