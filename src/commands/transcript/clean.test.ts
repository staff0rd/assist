import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExistsSync = vi.fn<(p: string) => boolean>();
const mockReadFileSync = vi.fn<(p: string) => string>();

vi.mock("node:fs", () => ({
	existsSync: (p: string) => mockExistsSync(p),
	readFileSync: (p: string) => mockReadFileSync(p),
}));

import { clean } from "./clean";

let exitCode: number | undefined;
let errorOutput: string[];
let logOutput: string[];

beforeEach(() => {
	vi.clearAllMocks();
	exitCode = undefined;
	errorOutput = [];
	logOutput = [];

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

const TEAMS_VTT = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>So I think we should

00:00:02.500 --> 00:00:05.000
<v Alice>So I think we should ship it today

00:00:06.000 --> 00:00:08.000
<v Bob>Agreed

00:00:08.200 --> 00:00:10.000
<v Bob>Agreed, let us do that

00:00:11.000 --> 00:00:13.000
<v Alice>Great`;

const TEAMS_VTT_WITH_CLOSING_TAGS = `WEBVTT

7e5f8a1c-0001-0002/1-0
00:00:01.000 --> 00:00:03.000
<v Alice>So I think we should</v>

7e5f8a1c-0001-0002/2-0
00:00:02.500 --> 00:00:05.000
<v Alice>So I think we should ship it today</v>

7e5f8a1c-0001-0002/3-0
00:00:06.000 --> 00:00:08.000
<v Bob>Agreed</v>`;

describe("clean", () => {
	describe("when given a real Teams .vtt with cue ids and closing </v> tags", () => {
		it("strips the closing tags so the rolling captions still collapse", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT_WITH_CLOSING_TAGS);

			clean("raw.vtt");

			expect(logOutput.join("")).toBe(
				"Alice: So I think we should ship it today\n\nBob: Agreed",
			);
		});

		it("emits no markup in the vtt output", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT_WITH_CLOSING_TAGS);

			clean("raw.vtt", { format: "vtt" });

			expect(logOutput.join("")).not.toContain("</v>");
		});
	});

	describe("when given a Teams-style .vtt with rolling-caption duplicates", () => {
		it("collapses the duplicated caption into one line per speaker turn", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("raw.vtt");

			expect(logOutput.join("")).toBe(
				"Alice: So I think we should ship it today\n\nBob: Agreed, let us do that\n\nAlice: Great",
			);
		});

		it("reads the given path rather than a configured directory", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("./some/where/raw.vtt");

			expect(mockReadFileSync).toHaveBeenCalledWith("./some/where/raw.vtt");
		});
	});

	describe("when asked for vtt output", () => {
		it("writes cleaned cues back as valid WebVTT with timings and voice tags", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("raw.vtt", { format: "vtt" });

			expect(logOutput.join("")).toBe(
				[
					"WEBVTT",
					"",
					"00:00:02.500 --> 00:00:05.000",
					"<v Alice>So I think we should ship it today",
					"",
					"00:00:08.200 --> 00:00:10.000",
					"<v Bob>Agreed, let us do that",
					"",
					"00:00:11.000 --> 00:00:13.000",
					"<v Alice>Great",
				].join("\n"),
			);
		});

		it("is stable when the cleaned output is cleaned again", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("raw.vtt", { format: "vtt" });
			const firstPass = logOutput.join("");

			logOutput = [];
			mockReadFileSync.mockReturnValue(firstPass);
			clean("clean.vtt", { format: "vtt" });

			expect(logOutput.join("")).toBe(firstPass);
		});
	});

	describe("when asked for timestamps", () => {
		it("prefixes each speaker turn with the start time of its first cue", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("raw.vtt", { format: "md", timestamps: true });

			expect(logOutput.join("")).toBe(
				[
					"[00:00:02] Alice: So I think we should ship it today",
					"",
					"[00:00:08] Bob: Agreed, let us do that",
					"",
					"[00:00:11] Alice: Great",
				].join("\n"),
			);
		});

		it("leaves the md output byte-identical when the flag is absent", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			clean("raw.vtt", { format: "md" });
			const withoutFlag = logOutput.join("");

			logOutput = [];
			clean("raw.vtt", { format: "md", timestamps: false });

			expect(withoutFlag).toBe(
				"Alice: So I think we should ship it today\n\nBob: Agreed, let us do that\n\nAlice: Great",
			);
			expect(logOutput.join("")).toBe(withoutFlag);
		});

		it("exits 1 when paired with vtt output, which already carries timings", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			expect(() =>
				clean("raw.vtt", { format: "vtt", timestamps: true }),
			).toThrow("process.exit(1)");

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: --timestamps applies only to --format md (got: vtt)",
			);
			expect(logOutput).toEqual([]);
		});
	});

	describe("when given an unknown format", () => {
		it("exits 1 with a stderr message and no stdout", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(TEAMS_VTT);

			expect(() => clean("raw.vtt", { format: "json" })).toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: --format must be one of: md, vtt (got: json)",
			);
			expect(logOutput).toEqual([]);
		});
	});

	describe("when the file does not exist", () => {
		it("exits 1 with a stderr message and no stdout", () => {
			mockExistsSync.mockReturnValue(false);

			expect(() => clean("missing.vtt")).toThrow("process.exit(1)");

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain("Error: VTT file not found: missing.vtt");
			expect(logOutput).toEqual([]);
		});
	});

	describe("when the file parses to zero cues", () => {
		it("exits 1 with a stderr message and no stdout", () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue("WEBVTT\n");

			expect(() => clean("empty.vtt")).toThrow("process.exit(1)");

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain("Error: no cues found in: empty.vtt");
			expect(logOutput).toEqual([]);
		});
	});
});
