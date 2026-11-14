import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SdkProcessInfo } from "../../../../../shared/harnessAdapters/types";
import { createSdkProcessWatch } from "./createSdkProcessWatch";
import { type FakeProc, writeFakeProc } from "./writeFakeProc";

let root: string;
let clock: number;

const curl = (wchar: number): FakeProc => ({
	pid: 200,
	ppid: 100,
	startTicks: 99_900,
	cmdline: ["curl", "--limit-rate", "20k", "-O", "big.iso"],
	io: { rchar: 0, wchar },
});

function setup(platform: NodeJS.Platform = "linux", pid = 100) {
	const events: (SdkProcessInfo | null)[] = [];
	const watch = createSdkProcessWatch(
		() => pid,
		(info) => events.push(info),
		{
			procRoot: root,
			platform,
			now: () => clock,
		},
	);
	return { events, watch };
}

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "fake-proc-"));
	clock = 0;
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
	rmSync(root, { recursive: true, force: true });
});

describe("createSdkProcessWatch", () => {
	it("emits the leaf command, then its IO rate every 2s, and clears on stop", async () => {
		writeFakeProc(root, [{ pid: 100, ppid: 1, startTicks: 10 }, curl(0)]);
		const { events, watch } = setup();
		await watch.start();
		await vi.waitFor(() => expect(events).toHaveLength(1));
		writeFakeProc(root, [curl(40_960)]);
		clock = 2000;
		await vi.advanceTimersByTimeAsync(2000);
		await vi.waitFor(() => expect(events).toHaveLength(2));
		watch.stop();
		expect(events).toEqual([
			{ command: "curl --limit-rate 20k -O big.iso" },
			{ command: "curl --limit-rate 20k -O big.iso", ioBytesPerSec: 20_480 },
			null,
		]);
		await vi.advanceTimersByTimeAsync(10_000);
		expect(events).toHaveLength(3);
	});

	it("never samples off Linux", async () => {
		writeFakeProc(root, [{ pid: 100, ppid: 1, startTicks: 10 }, curl(0)]);
		const { events, watch } = setup("win32");
		await watch.start();
		await vi.advanceTimersByTimeAsync(10_000);
		watch.stop();
		expect(events).toEqual([]);
	});

	it("does not sample before the CLI child exists", async () => {
		writeFakeProc(root, [curl(0)]);
		const { events, watch } = setup("linux", 0);
		await watch.start();
		await vi.advanceTimersByTimeAsync(10_000);
		expect(events).toEqual([]);
	});
});
