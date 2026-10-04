import { describe, expect, it } from "vitest";
import { pendingRestarts } from "./pendingRestarts";

const changes: Record<string, string[]> = {
	daemonStart: ["src/commands/sessions/daemon/onListening.ts", "README.md"],
	webStart: ["src/commands/sessions/web/ui/App.tsx"],
	head: [],
};
const changedSince = (commit: string) => changes[commit] ?? [];

describe("pendingRestarts", () => {
	it("asks for nothing when both processes started at HEAD on the built version", () => {
		expect(
			pendingRestarts({
				daemonVersion: "1.2.0",
				daemonStartCommit: "head",
				webStartCommit: "head",
				built: "1.2.0",
				changedSince,
			}),
		).toEqual([]);
	});

	it("restarts the daemon when it runs an older version than was built", () => {
		expect(
			pendingRestarts({
				daemonVersion: "1.1.0",
				daemonStartCommit: "head",
				webStartCommit: "head",
				built: "1.2.0",
				changedSince,
			}),
		).toEqual(["daemon"]);
	});

	it("restarts each process whose own code changed since it started", () => {
		expect(
			pendingRestarts({
				daemonVersion: "1.2.0",
				daemonStartCommit: "daemonStart",
				webStartCommit: "webStart",
				built: "1.2.0",
				changedSince,
			}),
		).toEqual(["daemon", "webserver"]);
	});

	it("ignores web UI changes since the daemon started and daemon changes since the web server started", () => {
		expect(
			pendingRestarts({
				daemonVersion: "1.2.0",
				daemonStartCommit: "webStart",
				webStartCommit: "daemonStart",
				built: "1.2.0",
				changedSince,
			}),
		).toEqual([]);
	});

	it("does not blame an unreachable daemon or an unreadable build", () => {
		expect(
			pendingRestarts({
				built: "1.2.0",
				changedSince,
			}),
		).toEqual([]);
		expect(
			pendingRestarts({
				daemonVersion: "1.1.0",
				built: "unknown",
				changedSince,
			}),
		).toEqual([]);
	});
});
