import { describe, expect, it } from "vitest";
import { parseVtt } from "./index";

describe("parseVtt", () => {
	describe("when given a valid VTT file", () => {
		it("should parse cues with timestamps and text", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
Hello world`;

			const result = parseVtt(vtt);

			expect(result).toEqual([
				{ startMs: 1000, endMs: 3000, speaker: null, text: "Hello world" },
			]);
		});

		it("should parse multiple cues", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
First line

00:00:04.000 --> 00:00:06.000
Second line`;

			const result = parseVtt(vtt);

			expect(result).toHaveLength(2);
		});
	});

	describe("when cues have speaker tags", () => {
		it("should extract the speaker name", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>Hello there`;

			const result = parseVtt(vtt);

			expect(result[0].speaker).toBe("Alice");
		});

		it("should strip the speaker tag from text", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
<v Alice>Hello there`;

			const result = parseVtt(vtt);

			expect(result[0].text).toBe("Hello there");
		});
	});

	describe("when using HH:MM:SS.mmm format", () => {
		it("should parse hours correctly", () => {
			const vtt = `WEBVTT

01:30:00.000 --> 01:30:05.500
Hour mark`;

			const result = parseVtt(vtt);

			expect(result[0].startMs).toBe(5400000);
			expect(result[0].endMs).toBe(5405500);
		});
	});

	describe("when using MM:SS.mmm format", () => {
		it("should parse without hours", () => {
			const vtt = `WEBVTT

02:30.000 --> 02:35.000
Two minutes in`;

			const result = parseVtt(vtt);

			expect(result[0].startMs).toBe(150000);
		});
	});

	describe("when cue text spans multiple lines", () => {
		it("should join lines with a space", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000
First line
Second line`;

			const result = parseVtt(vtt);

			expect(result[0].text).toBe("First line Second line");
		});
	});

	describe("when the cue text is empty", () => {
		it("should skip the cue", () => {
			const vtt = `WEBVTT

00:00:01.000 --> 00:00:03.000

00:00:04.000 --> 00:00:06.000
Actual text`;

			const result = parseVtt(vtt);

			expect(result).toHaveLength(1);
			expect(result[0].text).toBe("Actual text");
		});
	});

	describe("when given an empty string", () => {
		it("should return an empty array", () => {
			const result = parseVtt("");

			expect(result).toEqual([]);
		});
	});

	describe("when the VTT has numbered cue identifiers", () => {
		it("should skip the identifiers and parse cues", () => {
			const vtt = `WEBVTT

1
00:00:01.000 --> 00:00:03.000
Hello

2
00:00:04.000 --> 00:00:06.000
World`;

			const result = parseVtt(vtt);

			expect(result).toHaveLength(2);
			expect(result[0].text).toBe("Hello");
			expect(result[1].text).toBe("World");
		});
	});

	describe("when using Windows-style line endings", () => {
		it("should parse correctly", () => {
			const vtt = "WEBVTT\r\n\r\n00:00:01.000 --> 00:00:03.000\r\nHello";

			const result = parseVtt(vtt);

			expect(result).toHaveLength(1);
		});
	});
});
