import { describe, expect, it } from "vitest";
import type { Session } from "../types";
import { autopilotSessionState } from "./autopilotSessionState";

const session = (fields: Partial<Session>) => fields as Session;

describe("autopilotSessionState", () => {
	it.each([
		[undefined, "ended"],
		[session({ status: "running" }), "live"],
		[session({ status: "waiting" }), "ended"],
		[session({ status: "waiting", permissionActive: true }), "live"],
		[session({ status: "error" }), "errored"],
		[session({ status: "done" }), "ended"],
	] as const)("%o is %s", (input, expected) => {
		expect(autopilotSessionState(input)).toBe(expected);
	});
});
