import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";
import { findPortHolderPid } from "./findPortHolderPid";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const execMock = vi.mocked(execFileSync);

function asPlatform(platform: NodeJS.Platform): void {
	Object.defineProperty(process, "platform", {
		value: platform,
		configurable: true,
	});
}

const NETSTAT_OUTPUT = [
	"Active Connections",
	"",
	"  Proto  Local Address          Foreign Address        State           PID",
	"  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1204",
	"  TCP    127.0.0.1:51764        127.0.0.1:60123        ESTABLISHED     4444",
	"  TCP    0.0.0.0:51764          0.0.0.0:0              LISTENING       192936",
	"  UDP    0.0.0.0:51764          *:*                                    777",
].join("\n");

describe("findPortHolderPid", () => {
	const realPlatform = process.platform;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		asPlatform(realPlatform);
	});

	it("reads the listening pid out of netstat on windows", () => {
		asPlatform("win32");
		execMock.mockReturnValue(NETSTAT_OUTPUT);

		expect(findPortHolderPid(51764)).toBe(192936);
		expect(execMock).toHaveBeenCalledWith(
			"netstat",
			["-ano"],
			expect.objectContaining({ encoding: "utf8" }),
		);
	});

	it("ignores ports that merely share a suffix", () => {
		asPlatform("win32");
		execMock.mockReturnValue(NETSTAT_OUTPUT);

		expect(findPortHolderPid(1764)).toBeUndefined();
	});

	it("uses lsof off windows", () => {
		asPlatform("linux");
		execMock.mockReturnValue("192936\n");

		expect(findPortHolderPid(51764)).toBe(192936);
		expect(execMock).toHaveBeenCalledWith(
			"lsof",
			["-nP", "-iTCP:51764", "-sTCP:LISTEN", "-t"],
			expect.objectContaining({ encoding: "utf8" }),
		);
	});

	it("returns undefined when the probe fails", () => {
		asPlatform("linux");
		execMock.mockImplementation(() => {
			throw new Error("lsof: not found");
		});

		expect(findPortHolderPid(51764)).toBeUndefined();
	});

	it("returns undefined when nothing is listening", () => {
		asPlatform("linux");
		execMock.mockReturnValue("");

		expect(findPortHolderPid(51764)).toBeUndefined();
	});
});
