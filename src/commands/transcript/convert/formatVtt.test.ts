import { describe, expect, it } from "vitest";
import type { VttCue } from "../types";
import { formatVtt, formatVttPassages } from "./formatVtt";

const cue = (overrides: Partial<VttCue> = {}): VttCue => ({
	startMs: 0,
	endMs: 1000,
	speaker: "Alice",
	text: "Hello",
	...overrides,
});

describe("formatVtt", () => {
	describe("when given cues with speakers", () => {
		it("writes a WEBVTT header, timing lines and <v Speaker> tags", () => {
			const output = formatVtt([
				cue({ startMs: 1000, endMs: 3000, text: "So I think we should ship" }),
				cue({
					startMs: 6000,
					endMs: 8000,
					speaker: "Bob",
					text: "Agreed",
				}),
			]);

			expect(output).toBe(
				[
					"WEBVTT",
					"",
					"00:00:01.000 --> 00:00:03.000",
					"<v Alice>So I think we should ship",
					"",
					"00:00:06.000 --> 00:00:08.000",
					"<v Bob>Agreed",
				].join("\n"),
			);
		});
	});

	describe("when a cue runs past an hour", () => {
		it("formats hours, minutes, seconds and milliseconds", () => {
			const output = formatVtt([
				cue({ startMs: 3_723_456, endMs: 7_384_089, text: "Late" }),
			]);

			expect(output).toContain("01:02:03.456 --> 02:03:04.089");
		});
	});

	describe("when a cue has no speaker", () => {
		it("writes the text without a voice tag", () => {
			const output = formatVtt([
				cue({ speaker: null, text: "Unattributed line" }),
			]);

			expect(output).toBe(
				[
					"WEBVTT",
					"",
					"00:00:00.000 --> 00:00:01.000",
					"Unattributed line",
				].join("\n"),
			);
		});
	});

	describe("when given no cues", () => {
		it("writes just the WEBVTT header", () => {
			expect(formatVtt([])).toBe("WEBVTT");
		});
	});
});

describe("formatVttPassages", () => {
	describe("when given passages and header notes", () => {
		it("writes a NOTE header block and a NOTE source mark before each passage", () => {
			const output = formatVttPassages(
				[
					{
						source: "a.vtt",
						sourceStartMs: 862_000,
						cues: [cue({ startMs: 1000, endMs: 3000, text: "First" })],
					},
					{
						source: "b.vtt",
						sourceStartMs: 3_723_456,
						cues: [
							cue({
								startMs: 4000,
								endMs: 6000,
								speaker: "Bob",
								text: "Second",
							}),
						],
					},
				],
				["Collapsed 2026-09-04 from:", "  a.vtt", "  b.vtt"],
			);

			expect(output).toBe(
				[
					"WEBVTT",
					"",
					"NOTE Collapsed 2026-09-04 from:",
					"NOTE   a.vtt",
					"NOTE   b.vtt",
					"",
					"NOTE source: a.vtt @ 00:14:22",
					"",
					"00:00:01.000 --> 00:00:03.000",
					"<v Alice>First",
					"",
					"NOTE source: b.vtt @ 01:02:03",
					"",
					"00:00:04.000 --> 00:00:06.000",
					"<v Bob>Second",
				].join("\n"),
			);
		});
	});

	describe("when given no notes", () => {
		it("writes the source marks without a header block", () => {
			const output = formatVttPassages([
				{ source: "a.vtt", sourceStartMs: 0, cues: [cue({ text: "Only" })] },
			]);

			expect(output).toBe(
				[
					"WEBVTT",
					"",
					"NOTE source: a.vtt @ 00:00:00",
					"",
					"00:00:00.000 --> 00:00:01.000",
					"<v Alice>Only",
				].join("\n"),
			);
		});
	});
});
