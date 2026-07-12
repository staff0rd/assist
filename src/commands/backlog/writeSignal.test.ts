import { existsSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearSignalOwner, recordSignalOwner } from "./recordSignalOwner";
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

describe("writeSignal item routing", () => {
	const ITEM = 561;
	const OWNER = "owner-session";
	const FOREIGN = "foreign-session";

	function ownerSignalPath(): string {
		const path = getSignalPath(OWNER);
		if (!path) throw new Error("expected an owner signal path");
		return path;
	}

	function foreignSignalPath(): string {
		const path = getSignalPath(FOREIGN);
		if (!path) throw new Error("expected a foreign signal path");
		return path;
	}

	beforeEach(() => {
		delete process.env.ASSIST_SESSION_ID;
		clearSignalOwner(ITEM);
		for (const p of [ownerSignalPath(), foreignSignalPath()]) {
			if (existsSync(p)) rmSync(p);
		}
	});

	afterEach(() => {
		clearSignalOwner(ITEM);
		for (const p of [ownerSignalPath(), foreignSignalPath()]) {
			if (existsSync(p)) rmSync(p);
		}
		delete process.env.ASSIST_SESSION_ID;
	});

	it("routes an item-scoped signal from a foreign session to the run owner, leaving the caller's session untouched", () => {
		process.env.ASSIST_SESSION_ID = OWNER;
		recordSignalOwner(ITEM);

		process.env.ASSIST_SESSION_ID = FOREIGN;
		writeSignal("phase-done", { itemId: ITEM, phaseIndex: 1 });

		expect(existsSync(foreignSignalPath())).toBe(false);
		const signal = JSON.parse(readFileSync(ownerSignalPath(), "utf8"));
		expect(signal).toMatchObject({
			event: "phase-done",
			sessionId: OWNER,
			itemId: ITEM,
		});
	});

	it("refuses to signal an item with no live run rather than firing at the caller's session", () => {
		process.env.ASSIST_SESSION_ID = FOREIGN;
		writeSignal("rewind", { itemId: ITEM, targetPhase: 0 });

		expect(existsSync(foreignSignalPath())).toBe(false);
		expect(existsSync(ownerSignalPath())).toBe(false);
	});

	it("writes to the caller when it is the run owner", () => {
		process.env.ASSIST_SESSION_ID = OWNER;
		recordSignalOwner(ITEM);
		writeSignal("phase-done", { itemId: ITEM, phaseIndex: 1 });

		const signal = JSON.parse(readFileSync(ownerSignalPath(), "utf8"));
		expect(signal).toMatchObject({ event: "phase-done", sessionId: OWNER });
	});
});
