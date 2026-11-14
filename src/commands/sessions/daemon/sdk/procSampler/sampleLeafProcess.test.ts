import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sampleLeafProcess } from "./sampleLeafProcess";
import { writeFakeProc } from "./writeFakeProc";

let root: string;

beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), "fake-proc-"));
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("sampleLeafProcess", () => {
	it("picks the deepest live descendant started since the tool call", async () => {
		writeFakeProc(root, [
			{ pid: 100, ppid: 1, startTicks: 10, cmdline: ["claude"] },
			{ pid: 101, ppid: 100, startTicks: 20, cmdline: ["node", "/x/mcp.js"] },
			{ pid: 102, ppid: 101, startTicks: 21, cmdline: ["node", "/x/child.js"] },
			{
				pid: 200,
				ppid: 100,
				startTicks: 5000,
				cmdline: [
					"/bin/bash",
					"-c",
					"npx playwright install chromium | tail -3",
				],
			},
			{ pid: 201, ppid: 200, startTicks: 5001, cmdline: ["tail", "-3"] },
			{ pid: 202, ppid: 200, startTicks: 5001, cmdline: ["npm", "exec"] },
			{
				pid: 203,
				ppid: 202,
				startTicks: 5002,
				cpuTicks: 42,
				cmdline: [
					"/usr/bin/node",
					"/repo/node_modules/.bin/playwright",
					"install",
					"chromium",
				],
				io: { rchar: 900, wchar: 1200 },
			},
			{ pid: 204, ppid: 203, state: "Z", startTicks: 5003, cmdline: [] },
			{ pid: 300, ppid: 1, startTicks: 5100, cmdline: ["unrelated"] },
		]);
		expect(await sampleLeafProcess(root, 100, 4900)).toEqual({
			pid: 203,
			command: "playwright install chromium",
			cpuTicks: 42,
			readBytes: 900,
			writeBytes: 1200,
		});
	});

	it("returns nothing when no descendant started since the tool call", async () => {
		writeFakeProc(root, [
			{ pid: 100, ppid: 1, startTicks: 10, cmdline: ["claude"] },
			{ pid: 101, ppid: 100, startTicks: 20, cmdline: ["node", "/x/mcp.js"] },
		]);
		expect(await sampleLeafProcess(root, 100, 4900)).toBeUndefined();
	});

	it("leaves IO counters undefined when the io file is unreadable", async () => {
		writeFakeProc(root, [
			{ pid: 100, ppid: 1, startTicks: 10 },
			{
				pid: 200,
				ppid: 100,
				startTicks: 5000,
				comm: "sleep) (x",
				cmdline: ["sleep", "60"],
			},
		]);
		expect(await sampleLeafProcess(root, 100, 0)).toEqual({
			pid: 200,
			command: "sleep 60",
			cpuTicks: 0,
			readBytes: undefined,
			writeBytes: undefined,
		});
	});
});
