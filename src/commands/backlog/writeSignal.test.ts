import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSignalPath, writeSignal } from "./writeSignal";

describe("getSignalPath", () => {
	afterEach(() => {
		delete process.env.ASSIST_SESSION_ID;
	});

	it("returns undefined when no session is active", () => {
		delete process.env.ASSIST_SESSION_ID;
		expect(getSignalPath()).toBeUndefined();
	});

	it("resolves under ~/.assist keyed on the session id, never in the repo", () => {
		process.env.ASSIST_SESSION_ID = "abc123";
		expect(getSignalPath()).toBe(
			join(homedir(), ".assist", "signals", "signal-abc123.json"),
		);
	});
});

describe("writeSignal", () => {
	beforeEach(() => {
		delete process.env.ASSIST_SESSION_ID;
	});

	afterEach(() => {
		const path = getSignalPath();
		if (path && existsSync(path)) rmSync(path);
		delete process.env.ASSIST_SESSION_ID;
	});

	it("writes nothing when no session is active", () => {
		writeSignal("done");
		expect(getSignalPath()).toBeUndefined();
	});

	it("writes a session-keyed signal under ~/.assist", () => {
		process.env.ASSIST_SESSION_ID = "writes-here";
		writeSignal("next", { id: "42" });

		const path = getSignalPath();
		expect(path).toBeDefined();
		const signal = JSON.parse(readFileSync(path as string, "utf8"));
		expect(signal).toMatchObject({
			event: "next",
			sessionId: "writes-here",
			id: "42",
		});
	});
});
