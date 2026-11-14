import type { ChildProcess } from "node:child_process";
import { describe, expect, it, vi } from "vitest";
import type { SdkShellRow } from "../../shared/SdkShellRow";
import type { Session } from "../createSession";
import { killTree } from "../killTree";
import {
	stopSessionShellCommands,
	stopShellCommand,
	trackShellCommand,
} from "./stopShellCommand";

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../killTree", () => ({ killTree: vi.fn() }));

const row = (id: string, state: SdkShellRow["state"]): SdkShellRow => ({
	id,
	command: `echo ${id}`,
	output: [],
	state,
	startedAt: 0,
});

describe("stopShellCommand", () => {
	it("kills a running command's tree and marks it stopped", () => {
		const running = row("a", "running");
		const session = { id: "s1", sdkShell: [running] } as Session;
		trackShellCommand("s1", "a", { pid: 42 } as ChildProcess);
		expect(stopShellCommand(session, "a")).toBe(true);
		expect(killTree).toHaveBeenCalledWith(42);
		expect(running.stopped).toBe(true);
	});

	it("ignores a command that is no longer running", () => {
		const session = { id: "s2", sdkShell: [row("b", "held")] } as Session;
		trackShellCommand("s2", "b", { pid: 43 } as ChildProcess);
		expect(stopShellCommand(session, "b")).toBe(false);
	});

	it("kills running commands and drops held results on dismiss", () => {
		vi.mocked(killTree).mockClear();
		const session = {
			id: "s3",
			sdkShell: [row("c", "running"), row("d", "held")],
		} as Session;
		trackShellCommand("s3", "c", { pid: 44 } as ChildProcess);
		stopSessionShellCommands(session);
		expect(killTree).toHaveBeenCalledWith(44);
		expect(session.sdkShell).toBeUndefined();
	});
});
