import { describe, expect, it } from "vitest";
import type { Session } from "./createSession";
import { inheritAutopilot } from "./inheritAutopilot";

const sessions: Record<string, Session> = {
	auto: { id: "auto", autopilot: "root" } as Session,
	plain: { id: "plain" } as Session,
};

describe("inheritAutopilot", () => {
	it("carries the parent's autopilot run to the child", () => {
		const d: Record<string, unknown> = { autopilotFrom: "auto" };
		inheritAutopilot(d, (id) => sessions[id]);
		expect(d).toEqual({ autopilot: "root" });
	});

	it("leaves a child of an interactive session unmarked", () => {
		const d: Record<string, unknown> = { autopilotFrom: "plain" };
		inheritAutopilot(d, (id) => sessions[id]);
		expect(d).toEqual({});
	});
});
