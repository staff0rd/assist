import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExistsSync = vi.fn<(p: string) => boolean>();
const mockReadFileSync = vi.fn<(p: string) => string>();
const mockWriteFileSync =
	vi.fn<(p: string, data: string, encoding: string) => void>();
const mockReadStdinBuffer = vi.fn<() => Promise<Buffer>>();

vi.mock("node:fs", () => ({
	existsSync: (p: string) => mockExistsSync(p),
	readFileSync: (p: string) => mockReadFileSync(p),
	writeFileSync: (p: string, data: string, encoding: string) =>
		mockWriteFileSync(p, data, encoding),
}));

vi.mock("../backlog/import/readStdinBuffer", () => ({
	readStdinBuffer: () => mockReadStdinBuffer(),
}));

import { parseVtt } from "./convert/parseVtt";
import { merge } from "./merge";

let exitCode: number | undefined;
let errorOutput: string[];
let logOutput: string[];
let files: Record<string, string>;

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

const PROFANE_VTT = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>That fucking coach screen is slow

00:00:06.000 --> 00:00:08.000
<v Bob>Fuck.

00:00:11.000 --> 00:00:13.000
<v Bob>Fuck it. We'll just say this one's ready`;

type Keep = { file: string; from: string; to: string };

function selectionFile(keep: Keep[], removed: string[] = []): string {
	files["./sel.json"] = JSON.stringify({ keep, removed });
	return "./sel.json";
}

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
	files = {
		"./raw/a.vtt": FIRST_VTT,
		"./raw/b.vtt": SECOND_VTT,
		"./raw/c.vtt": PROFANE_VTT,
	};

	mockExistsSync.mockImplementation((p) => p in files);
	mockReadFileSync.mockImplementation((p) => files[p] ?? "");

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
		it("writes one WEBVTT document with a header block and per-source marks", async () => {
			await merge(["./raw/a.vtt", "./raw/b.vtt"]);

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

		it("rebases the second source so cue times keep increasing across the join", async () => {
			await merge(["./raw/a.vtt", "./raw/b.vtt"]);

			const starts = startTimes(logOutput.join(""));

			expect(starts).toHaveLength(4);
			expect([...starts].sort()).toEqual(starts);
			expect(new Set(starts).size).toBe(starts.length);
		});

		it("keeps the sources in argument order", async () => {
			await merge(["./raw/b.vtt", "./raw/a.vtt"]);

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
		it("writes the document to that path instead of stdout", async () => {
			await merge(["./raw/a.vtt"], { out: "./out/merged.vtt" });

			const [path, data] = mockWriteFileSync.mock.calls[0];

			expect(path).toBe("./out/merged.vtt");
			expect(data).toContain("NOTE source: a.vtt @ 00:00:01");
			expect(data.endsWith("\n")).toBe(true);
			expect(logOutput.join("")).not.toContain("WEBVTT");
		});
	});

	describe("when a source does not exist", () => {
		it("exits 1 with a stderr message naming it and writes nothing", async () => {
			await expect(merge(["./raw/a.vtt", "./raw/missing.vtt"])).rejects.toThrow(
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
		it("exits 1 with a stderr message naming it", async () => {
			files["./raw/empty.vtt"] = "WEBVTT\n";

			await expect(merge(["./raw/a.vtt", "./raw/empty.vtt"])).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain("Error: no cues found in: ./raw/empty.vtt");
			expect(logOutput).toEqual([]);
		});
	});

	describe("when given --select", () => {
		it("keeps only the cues inside the named ranges", async () => {
			const select = selectionFile([
				{ file: "b.vtt", from: "00:14:28.000", to: "00:14:35.000" },
			]);

			await merge(["./raw/a.vtt", "./raw/b.vtt"], { select });

			expect(logOutput.join("")).toBe(
				[
					"WEBVTT",
					"",
					"NOTE Collapsed 2026-09-04 from:",
					"NOTE   a.vtt",
					"NOTE   b.vtt",
					"",
					"NOTE source: b.vtt @ 00:14:30",
					"",
					"00:00:00.000 --> 00:00:03.000",
					"<v Alice>Right",
				].join("\n"),
			);
		});

		it("marks each kept run separately when one file contributes several", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "00:00:00.000", to: "00:00:04.000" },
				{ file: "a.vtt", from: "00:00:05.000", to: "00:00:09.000" },
			]);

			await merge(["./raw/a.vtt"], { select });

			expect(logOutput.join("")).toContain(
				[
					"NOTE source: a.vtt @ 00:00:01",
					"",
					"00:00:00.000 --> 00:00:02.000",
					"<v Alice>Morning all",
					"",
					"NOTE source: a.vtt @ 00:00:06",
					"",
					"00:00:03.000 --> 00:00:05.000",
					"<v Bob>Morning",
				].join("\n"),
			);
		});

		it("accepts a source's full path in place of its basename", async () => {
			const select = selectionFile([
				{ file: "./raw/a.vtt", from: "00:00:00.000", to: "00:00:04.000" },
			]);

			await merge(["./raw/a.vtt"], { select });

			expect(logOutput.join("")).toContain("NOTE source: a.vtt @ 00:00:01");
		});

		it("counts the removed passages and lists the distinct reasons", async () => {
			const select = selectionFile(
				[{ file: "a.vtt", from: "00:00:00.000", to: "00:00:09.000" }],
				["private", "off-topic", "off-topic"],
			);

			await merge(["./raw/a.vtt"], { select });

			expect(logOutput.join("")).toContain(
				"NOTE 3 passages removed: private, off-topic",
			);
		});

		it("says passage rather than passages for a single removal", async () => {
			const select = selectionFile(
				[{ file: "a.vtt", from: "00:00:00.000", to: "00:00:09.000" }],
				["private"],
			);

			await merge(["./raw/a.vtt"], { select });

			expect(logOutput.join("")).toContain("NOTE 1 passage removed: private");
		});

		it("omits the removed line when nothing was removed", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "00:00:00.000", to: "00:00:09.000" },
			]);

			await merge(["./raw/a.vtt"], { select });

			expect(logOutput.join("")).not.toContain("removed");
		});
	});

	describe("when provenance is turned off", () => {
		it("writes a WEBVTT document carrying no NOTE at all", async () => {
			await merge(["./raw/a.vtt", "./raw/b.vtt"], { provenance: false });

			expect(logOutput.join("")).toBe(
				[
					"WEBVTT",
					"",
					"00:00:00.000 --> 00:00:02.000",
					"<v Alice>Morning all",
					"",
					"00:00:05.000 --> 00:00:07.000",
					"<v Bob>Morning",
					"",
					"00:00:08.000 --> 00:00:11.000",
					"<v Shannon>So the coach screen",
					"",
					"00:00:16.000 --> 00:00:19.000",
					"<v Alice>Right",
				].join("\n"),
			);
		});

		it("leaves a document that still parses back to every cue", async () => {
			await merge(["./raw/a.vtt", "./raw/b.vtt"], { provenance: false });

			const document = logOutput.join("");

			expect(document.startsWith("WEBVTT")).toBe(true);
			expect(parseVtt(document).map((c) => c.text)).toEqual([
				"Morning all",
				"Morning",
				"So the coach screen",
				"Right",
			]);
		});

		it("drops the removed count along with the source names", async () => {
			const select = selectionFile(
				[{ file: "a.vtt", from: "00:00:00.000", to: "00:00:09.000" }],
				["private", "offensive"],
			);

			await merge(["./raw/a.vtt"], { select, provenance: false });

			expect(logOutput.join("")).not.toContain("NOTE");
			expect(logOutput.join("")).not.toContain("removed");
			expect(logOutput.join("")).not.toContain("private");
		});
	});

	describe("when provenance is left alone", () => {
		it("writes the same bytes as an unflagged merge", async () => {
			await merge(["./raw/a.vtt", "./raw/b.vtt"]);
			const unflagged = logOutput.join("");

			logOutput = [];
			await merge(["./raw/a.vtt", "./raw/b.vtt"], { provenance: true });

			expect(logOutput.join("")).toBe(unflagged);
			expect(unflagged).toContain("NOTE Collapsed 2026-09-04 from:");
		});
	});

	describe("when the audience is widened", () => {
		it("deletes the removable asides and drops the cue that is nothing but one", async () => {
			await merge(["./raw/c.vtt"], { widenAudience: true, provenance: false });

			expect(logOutput.join("")).toBe(
				[
					"WEBVTT",
					"",
					"00:00:00.000 --> 00:00:02.000",
					"<v Alice>That coach screen is slow",
					"",
					"00:00:10.000 --> 00:00:12.000",
					"<v Bob>Fuck it. We'll just say this one's ready",
				].join("\n"),
			);
		});

		it("keeps the cue times increasing across the dropped cue", async () => {
			await merge(["./raw/c.vtt", "./raw/b.vtt"], { widenAudience: true });

			const starts = startTimes(logOutput.join(""));

			expect(starts).toHaveLength(4);
			expect([...starts].sort()).toEqual(starts);
			expect(new Set(starts).size).toBe(starts.length);
		});
	});

	describe("when the audience is left alone", () => {
		it("writes every cue through as it stands", async () => {
			await merge(["./raw/c.vtt"]);

			expect(logOutput.join("")).toContain(
				"<v Alice>That fucking coach screen is slow",
			);
			expect(logOutput.join("")).toContain("<v Bob>Fuck.");
		});
	});

	describe("when --select is -", () => {
		it("reads the selection from stdin", async () => {
			mockReadStdinBuffer.mockResolvedValue(
				Buffer.from(
					JSON.stringify({
						keep: [{ file: "b.vtt", from: "00:14:28.000", to: "00:14:35.000" }],
						removed: ["private"],
					}),
				),
			);

			await merge(["./raw/b.vtt"], { select: "-" });

			expect(logOutput.join("")).toContain("NOTE source: b.vtt @ 00:14:30");
			expect(logOutput.join("")).toContain("NOTE 1 passage removed: private");
			expect(logOutput.join("")).not.toContain("So the coach screen");
		});
	});

	describe("when the selection is unusable", () => {
		it("exits 1 naming a file that was not given as a source", async () => {
			const select = selectionFile([
				{ file: "c.vtt", from: "00:00:00.000", to: "00:00:09.000" },
			]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: selection names a file that was not given: c.vtt",
			);
			expect(logOutput).toEqual([]);
		});

		it("exits 1 naming a malformed timestamp", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "00:00:xx", to: "00:00:09.000" },
			]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				'Error: malformed timestamp "00:00:xx" in selection range 00:00:xx --> 00:00:09.000 in a.vtt',
			);
		});

		it("exits 1 naming a range that lies outside its source", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "01:00:00.000", to: "01:10:00.000" },
			]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: selection range 01:00:00.000 --> 01:10:00.000 in a.vtt lies outside that file's cues",
			);
		});

		it("exits 1 naming a range whose end precedes its start", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "00:00:09.000", to: "00:00:01.000" },
			]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(errorOutput).toContain(
				"Error: selection range 00:00:09.000 --> 00:00:01.000 in a.vtt ends before it starts",
			);
		});

		it("exits 1 when the ranges keep nothing", async () => {
			const select = selectionFile([
				{ file: "a.vtt", from: "00:00:04.000", to: "00:00:05.000" },
			]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput).toContain(
				"Error: selection kept no cues from any source",
			);
			expect(logOutput).toEqual([]);
		});

		it("exits 1 when the selection keeps no ranges at all", async () => {
			const select = selectionFile([]);

			await expect(merge(["./raw/a.vtt"], { select })).rejects.toThrow(
				"process.exit(1)",
			);

			expect(exitCode).toBe(1);
			expect(errorOutput.join("")).toContain(
				"a selection needs at least one keep range",
			);
		});

		it("exits 1 when the selection is not valid JSON", async () => {
			files["./sel.json"] = "{ not json";

			await expect(
				merge(["./raw/a.vtt"], { select: "./sel.json" }),
			).rejects.toThrow("process.exit(1)");

			expect(exitCode).toBe(1);
			expect(errorOutput.join("")).toContain("not valid JSON");
		});
	});
});
