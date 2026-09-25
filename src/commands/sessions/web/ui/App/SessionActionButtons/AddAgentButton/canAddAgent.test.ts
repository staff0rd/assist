import { describe, expect, it } from "vitest";
import { canAddAgent } from "./canAddAgent";
import type { SessionInfo } from "../../../types";

function card(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "3",
		name: "assist backlog run 5",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		cwd: "/git/repo-2",
		joinable: true,
		...overrides,
	};
}

describe("canAddAgent", () => {
	it("is offered on a card the daemon reports as joinable", () => {
		expect(canAddAgent(card())).toBe(true);
	});

	it("is offered on a finished, errored or stopped joinable card", () => {
		expect(canAddAgent(card({ status: "done" }))).toBe(true);
		expect(canAddAgent(card({ status: "error" }))).toBe(true);
		expect(canAddAgent(card({ status: "stopped" }))).toBe(true);
	});

	it("is withheld from a card the daemon refuses to join", () => {
		expect(canAddAgent(card({ joinable: false }))).toBe(false);
	});

	it("is withheld from a card carrying no verdict", () => {
		expect(canAddAgent(card({ joinable: undefined }))).toBe(false);
	});

	it("follows the verdict rather than re-deriving it from the card", () => {
		expect(canAddAgent(card({ commandType: "run" }))).toBe(true);
		expect(canAddAgent(card({ joinable: false, cwd: "/git/repo-2" }))).toBe(
			false,
		);
	});
});
