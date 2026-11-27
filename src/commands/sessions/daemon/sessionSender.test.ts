import { describe, expect, it } from "vitest";
import { sessionSender } from "./sessionSender";
import type { Session } from "./types";

const sessions = new Map([
	["2", { id: "2", claudeSessionId: "c2" } as Session],
	["4", { id: "4" } as Session],
]);
const names = () => new Map([["c2", "yoke-2-e6"]]);

describe("sessionSender", () => {
	it("resolves the sender's agent name from its harness session", () => {
		expect(sessionSender(sessions, "2", names)).toEqual({
			id: "2",
			agent: "yoke-2-e6",
		});
	});

	it("returns the id alone when the agent name is unknown", () => {
		expect(sessionSender(sessions, "4", names)).toEqual({ id: "4" });
	});

	it("returns undefined for an unknown session", () => {
		expect(sessionSender(sessions, "9", names)).toBeUndefined();
	});
});
