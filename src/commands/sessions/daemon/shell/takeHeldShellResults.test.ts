import { describe, expect, it, vi } from "vitest";
import type { SdkShellRow } from "../../shared/SdkShellRow";
import type { Session } from "../createSession";
import { takeHeldShellResults } from "./takeHeldShellResults";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));

const row = (id: string, state: SdkShellRow["state"]): SdkShellRow => ({
	id,
	command: `echo ${id}`,
	output: [{ stream: "stdout", text: `${id}\n` }],
	state,
	startedAt: 0,
});

describe("takeHeldShellResults", () => {
	it("formats held rows, drops them and keeps running ones", () => {
		const running = row("b", "running");
		const session = { id: "1", sdkShell: [row("a", "held"), running] };
		const notify = vi.fn();
		expect(takeHeldShellResults(session as Session, notify)).toBe(
			"<bash-input>echo a</bash-input>\n<bash-stdout>a</bash-stdout><bash-stderr></bash-stderr>",
		);
		expect(session.sdkShell).toEqual([running]);
		expect(notify).toHaveBeenCalled();
	});

	it("returns nothing when no results are held", () => {
		const session = { id: "1", sdkShell: [row("b", "running")] };
		expect(takeHeldShellResults(session as Session)).toBe("");
	});
});
