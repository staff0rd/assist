import { describe, expect, it } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import { awaitRunEstablished } from "./awaitRunEstablished";

const fast = { pollMs: 1, startCapMs: 50, graceMs: 10 };
const pty = {} as NonNullable<Session["pty"]>;

function sessionsWith(overrides: Partial<Session>): Map<string, Session> {
	return new Map([
		["4", makeSession({ id: "4", status: "running", ...overrides })],
	]);
}

describe("awaitRunEstablished", () => {
	it("succeeds once a started run survives the startup grace", async () => {
		await expect(
			awaitRunEstablished(sessionsWith({ pty }), "4", fast),
		).resolves.toEqual({ ok: true, reason: "survived startup" });
	});

	it("fails when the run errors during startup", async () => {
		const sessions = sessionsWith({ pty });
		const result = awaitRunEstablished(sessions, "4", fast);
		const s = sessions.get("4") as Session;
		s.status = "error";
		s.error = "process exited with code 1";
		await expect(result).resolves.toEqual({
			ok: false,
			error: "process exited with code 1",
		});
	});

	it("fails when the target session vanishes", async () => {
		await expect(awaitRunEstablished(new Map(), "4", fast)).resolves.toEqual({
			ok: false,
			error: "target session vanished",
		});
	});

	it("gives up waiting on a run still seeding at the cap", async () => {
		await expect(
			awaitRunEstablished(
				sessionsWith({ pty: null, awaitingSeed: true }),
				"4",
				fast,
			),
		).resolves.toEqual({ ok: true, reason: "still seeding at cap" });
	});
});
