import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../../../../test/mothers/makeSessionInfo";
import { canAddAgent } from "./canAddAgent";

describe("canAddAgent", () => {
	it("is offered on a card the daemon reports as joinable", () => {
		expect(canAddAgent(makeSessionInfo({ joinable: true }))).toBe(true);
	});

	it("is offered on a finished, errored or stopped joinable card", () => {
		expect(
			canAddAgent(makeSessionInfo({ joinable: true, status: "done" })),
		).toBe(true);
		expect(
			canAddAgent(makeSessionInfo({ joinable: true, status: "error" })),
		).toBe(true);
		expect(
			canAddAgent(makeSessionInfo({ joinable: true, status: "stopped" })),
		).toBe(true);
	});

	it("is withheld from a card the daemon refuses to join", () => {
		expect(canAddAgent(makeSessionInfo({ joinable: false }))).toBe(false);
	});

	it("is withheld from a card carrying no verdict", () => {
		expect(canAddAgent(makeSessionInfo({ joinable: undefined }))).toBe(false);
	});

	it("follows the verdict rather than re-deriving it from the card", () => {
		expect(
			canAddAgent(makeSessionInfo({ joinable: true, commandType: "run" })),
		).toBe(true);
		expect(
			canAddAgent(
				makeSessionInfo({
					joinable: false,
					status: "running",
					cwd: "/git/repo-2",
				}),
			),
		).toBe(false);
	});
});
