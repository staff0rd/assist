import { describe, expect, it, vi } from "vitest";
import { typeKeysIntoSession } from "./typeKeysIntoSession";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

function sessions(session?: Partial<Session>): Map<string, Session> {
	return new Map(
		session ? [["s1", { id: "s1", pty: {}, ...session } as Session]] : [],
	);
}

describe("typeKeysIntoSession", () => {
	it("writes the keys raw, without pasting or submitting", () => {
		const write = vi.fn();
		expect(
			typeKeysIntoSession(sessions({ status: "waiting" }), "s1", "1\r", write),
		).toEqual({ ok: true, message: "Sent keys to assist session s1" });
		expect(write.mock.calls).toEqual([["s1", "1\r"]]);
	});

	it.each([
		["does not exist", undefined, "assist session s1 was not found"],
		["has ended", { status: "done" as const }, "assist session s1 has ended"],
		["has no terminal", { pty: undefined }, "assist session s1 has ended"],
	])("refuses a session that %s", (_, session, message) => {
		const write = vi.fn();
		expect(typeKeysIntoSession(sessions(session), "s1", "y", write)).toEqual({
			ok: false,
			message,
		});
		expect(write).not.toHaveBeenCalled();
	});
});
