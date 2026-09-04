import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExistsSync = vi.fn<(p: string) => boolean>();
const mockReadFileSync = vi.fn<(p: string) => string>();
const mockWriteFileSync =
	vi.fn<(p: string, data: string, encoding: string) => void>();

vi.mock("node:fs", () => ({
	existsSync: (p: string) => mockExistsSync(p),
	readFileSync: (p: string) => mockReadFileSync(p),
	writeFileSync: (p: string, data: string, encoding: string) =>
		mockWriteFileSync(p, data, encoding),
}));

import { merge } from "./merge";

let exitCode: number | undefined;
let errorOutput: string[];
let logOutput: string[];

const FIRST_VTT = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>Morning all

00:00:06.000 --> 00:00:08.000
<v Bob>Morning`;

const SECOND_VTT = `WEBVTT

00:14:22.000 --> 00:14:25.000
<v Shannon>So the coach screen

00:14:30.000 --> 00:14:33.000
<v Alice>Right`;

const SOURCES: Record<string, string> = {
	"./raw/a.vtt": FIRST_VTT,
	"./raw/b.vtt": SECOND_VTT,
};

function startTimes(document: string): string[] {
	return [...document.matchAll(/^(\d\d:\d\d:\d\d\.\d\d\d) -->/gm)].map(
		(match) => match[1],
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(new Date("2026-09-04T09:00:00Z"));
	exitCode = undefined;
	errorOutput = [];
	logOutput = [];

	mockExistsSync.mockImplementation((p) => p in SOURCES);
	mockReadFileSync.mockImplementation((p) => SOURCES[p] ?? "");

	vi.spyOn(process, "exit").mockImplementation((code) => {
		exitCode = code as number;
		throw new Error(`process.exit(${code})`);
	});
	vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
		errorOutput.push(args.join(" "));
	});
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		logOutput.push(args.join(" "));
	});
});

afterEach(() => {
	vi.useRealTimers();
});

describe("merge", () => {
	describe("when given two .vtt files", () => {
		it("writes one WEBVTT document with a header block and per-source marks", () => {
			merge(["./raw/a.vtt", "./raw/b.vtt"]);

			expect(logOutput.join("")).toBe(
				[
					"WEBVTT",
					"",
					"NOTE Collapsed 2026-09-04 from:",
					"NOTE   a.vtt",
					"NOTE   b.vtt",
					"",
					"NOTE source: a.vtt @ 00:00:01",
					"",
					"00:00:00.000 --> 00:00:02.000",
					"<v Alice>Morning all",
					"",
					"00:00:05.000 --> 00:00:07.000",
					"<v Bob>Morning",
					"",
					"NOTE source: b.vtt @ 00:14:22",
					"",
					"00:00:08.000 --> 00:00:11.000",
					"<v Shannon>So the coach screen",
					"",
					"00:00:16.000 --> 00:00:19.000",
					"<v Alice>Right",
				].join("\n"),
			);
		});

		it("rebases the second source so cue times keep increasing across the join", () => {
			merge(["./raw/a.vtt", "./raw/b.vtt"]);

			const starts = startTimes(logOutput.join(""));

			expect(starts).toHaveLength(4);
			expect([...starts].sort()).toEqual(starts);
			expect(new Set(starts).size).toBe(starts.length);
		});

		it("keeps the sources in argument order", () => {
			merge(["./raw/b.vtt", "./raw/a.vtt"]);

			expect(logOutput.join("")).toContain(
				["NOTE   b.vtt", "NOTE   a.vtt"].join("\n"),
			);
			expect(logOutput.join("")).toContain(
				[
					"NOTE source: b.vtt @ 00:14:22",
					"",
					"00:00:00.000 --> 00:00:03.000",
				].join("\n"),
			);
		});
	});

	describe("when given --out", () => {
		it("writes the document to that path instead of stdout", () => {
			merge(["./raw/a.vtt"], { out: "./out/merged.vtt" });

			const [path, data] = mockWriteFileSync.mock.calls[0];

			expect(path).toBe("./out/merged.vtt");
			expect(data).toContain("NOTE source: a.vtt @ 00:00:01");
			expect(data.endsWith("\n")).toBe(true);
			expect(logOutput.join("")).not.toContain("WEBVTT");
		});
	});

	describe("when a source does not exist", () => {
		it("exits 1 with a stderr message naming it and writes nothing", () => {
			expect(() => merge(["./raw/a.vtt", "./raw/missing.vtt"])).toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: VTT file not found: ./raw/missing.vtt",
			);
			expect(logOutput).toEqual([]);
		});
	});

	describe("when a source parses to zero cues", () => {
		it("exits 1 with a stderr message naming it", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockImplementation((p) => SOURCES[p] ?? "WEBVTT\n");

			expect(() => merge(["./raw/a.vtt", "./raw/empty.vtt"])).toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain("Error: no cues found in: ./raw/empty.vtt");
			expect(logOutput).toEqual([]);
		});
	});
});
