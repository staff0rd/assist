import { describe, expect, it, vi } from "vitest";
import type { SdkShellRow } from "../../shared/SdkShellRow";
import type { Session } from "../createSession";
import { discardShellResult } from "./discardShellResult";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

const row = (id: string, state: SdkShellRow["state"]): SdkShellRow => ({
	id,
	command: `echo ${id}`,
	output: [],
	state,
	startedAt: 0,
});

describe("discardShellResult", () => {
	it("removes a held row and keeps the others", () => {
		const session = {
			id: "s1",
			sdkShell: [row("a", "held"), row("b", "held"), row("c", "running")],
		} as Session;
		expect(discardShellResult(session, "a")).toBe(true);
		expect(session.sdkShell?.map((r) => r.id)).toEqual(["b", "c"]);
	});

	it("clears the list when the last row is discarded", () => {
		const session = { id: "s2", sdkShell: [row("a", "held")] } as Session;
		expect(discardShellResult(session, "a")).toBe(true);
		expect(session.sdkShell).toBeUndefined();
	});

	it("ignores a running row", () => {
		const session = { id: "s3", sdkShell: [row("a", "running")] } as Session;
		expect(discardShellResult(session, "a")).toBe(false);
		expect(session.sdkShell).toHaveLength(1);
	});

	it("ignores a missing row", () => {
		const session = { id: "s4", sdkShell: [row("a", "held")] } as Session;
		expect(discardShellResult(session, "x")).toBe(false);
		expect(discardShellResult({ id: "s5" } as Session, "x")).toBe(false);
		expect(session.sdkShell).toHaveLength(1);
	});
});
