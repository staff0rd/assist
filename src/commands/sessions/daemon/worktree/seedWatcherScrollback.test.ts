import { readFileSync, rmSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appendWatcherLog } from "./appendWatcherLog";
import { seedWatcherScrollback } from "./seedWatcherScrollback";
import { watcherLogPath } from "./watcherLogPath";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

const clone = "/git/watched-clone";

describe("seedWatcherScrollback", () => {
	beforeEach(() => {
		rmSync(watcherLogPath(clone), { force: true });
	});

	it("starts a clone's first watcher with just the event note", () => {
		const scrollback = seedWatcherScrollback(clone, "watcher started");

		expect(scrollback).toContain("watcher started at");
		expect(readFileSync(watcherLogPath(clone), "utf8")).toBe(scrollback);
	});

	it("carries a watcher's earlier output into its next session", () => {
		appendWatcherLog({ watcher: true, cwd: clone }, "lap 1 exited 3\r\n");
		appendWatcherLog(
			{ watcher: true, cwd: clone },
			"── divergence escalated to session 7 ──\r\n",
		);

		const scrollback = seedWatcherScrollback(
			clone,
			"daemon restarted; watcher relaunched",
		);

		expect(scrollback).toMatch(
			/lap 1 exited 3[\s\S]*divergence escalated to session 7[\s\S]*daemon restarted; watcher relaunched/,
		);
	});

	it("does not log output from a session that is not a watcher", () => {
		appendWatcherLog({ watcher: false, cwd: clone }, "claude output\r\n");

		expect(seedWatcherScrollback(clone, "watcher started")).not.toContain(
			"claude output",
		);
	});
});
