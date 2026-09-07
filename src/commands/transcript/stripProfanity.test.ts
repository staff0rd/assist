import { describe, expect, it } from "vitest";
import { stripProfanity } from "./stripProfanity";
import { stripProfanityFromText } from "./stripProfanityFromText";
import type { VttCue, VttPassage } from "./types";

function cue(startMs: number, text: string): VttCue {
	return { startMs, endMs: startMs + 2000, speaker: "Alice", text };
}

function passage(cues: VttCue[]): VttPassage {
	return { source: "a.vtt", sourceStartMs: cues[0].startMs, cues };
}

describe("stripProfanityFromText", () => {
	describe("when profanity intensifies the word after it", () => {
		it.each([
			["that fucking thing", "that thing"],
			["I fucking railed against that", "I railed against that"],
			["it was a fuckin' mess", "it was a mess"],
			["the damn pipeline fell over", "the pipeline fell over"],
			["that goddamn migration again", "that migration again"],
		])("deletes it from %j", (text, expected) => {
			expect(stripProfanityFromText(text)).toBe(expected);
		});
	});

	describe("when profanity follows a wh-word", () => {
		it.each([
			["whatever the fuck you like", "whatever you like"],
			["how the hell does that work", "how does that work"],
			["I know what the fuck happened", "I know what happened"],
		])("deletes the fuck/the hell from %j", (text, expected) => {
			expect(stripProfanityFromText(text)).toBe(expected);
		});
	});

	describe("when profanity stands alone as an interjection", () => {
		it.each([
			[
				"And I'm like, fuck. Like, there is...",
				"And I'm like, Like, there is...",
			],
			["Shit. That explains the latency", "That explains the latency"],
			["The build is broken, fuck.", "The build is broken"],
			["Oh, fucking hell. Try it again", "Try it again"],
		])("deletes it from %j", (text, expected) => {
			expect(stripProfanityFromText(text)).toBe(expected);
		});
	});

	describe("when profanity is load-bearing", () => {
		it.each([
			"I did fuck with that Azure b2c",
			"I don't know fuck all about the implementation",
			"Fuck it. We'll just say this one's ready",
			"it is very clear that it is fucked",
			"no wonder that shit's clunky",
			"we had telemetry shit and extra debug shit in there",
			"we don't give a shit, we're making this shit up",
			"I probably just went, fuck you. I'm using Clerk",
			"damned if I know what it was doing",
		])("leaves %j untouched", (text) => {
			expect(stripProfanityFromText(text)).toBe(text);
		});
	});

	describe("when the expletive heads an interjection", () => {
		it.each([
			"Goddamn it. The token expired again",
			"Damn it. That was the wrong branch",
		])("leaves the word after it standing in %j", (text) => {
			expect(stripProfanityFromText(text)).toBe(text);
		});
	});

	describe("when a deletion would leave a gap", () => {
		it("collapses the doubled space rather than substituting a marker", () => {
			const stripped = stripProfanityFromText(
				"we fucking shipped the fucking thing",
			);

			expect(stripped).toBe("we shipped the thing");
			expect(stripped).not.toMatch(/ {2}/);
			expect(stripped).not.toMatch(/\*|\[|censor/i);
		});

		it("leaves no space before the punctuation that follows", () => {
			expect(stripProfanityFromText("It was, fucking, ridiculous")).toBe(
				"It was, ridiculous",
			);
		});

		it("drops the comma left stranded at the end", () => {
			expect(stripProfanityFromText("So we reverted it, shit.")).toBe(
				"So we reverted it",
			);
		});
	});

	describe("when the text carries no profanity", () => {
		it("returns it byte-identical", () => {
			const text = "So the coach screen  is slow, and the sync is worse,";

			expect(stripProfanityFromText(text)).toBe(text);
		});
	});
});

describe("stripProfanity", () => {
	describe("when a cue is nothing but an expletive", () => {
		it("drops the cue and keeps the rest", () => {
			const [stripped] = stripProfanity([
				passage([
					cue(0, "Morning all"),
					cue(3000, "Fuck."),
					cue(6000, "Right"),
				]),
			]);

			expect(stripped.cues.map((c) => c.text)).toEqual([
				"Morning all",
				"Right",
			]);
		});

		it("moves the passage's source start onto the first surviving cue", () => {
			const [stripped] = stripProfanity([
				passage([cue(0, "Oh, shit!"), cue(3000, "Right")]),
			]);

			expect(stripped.sourceStartMs).toBe(3000);
		});
	});

	describe("when nothing in a passage survives", () => {
		it("drops the passage", () => {
			expect(stripProfanity([passage([cue(0, "Fuck.")])])).toEqual([]);
		});
	});

	describe("when a cue keeps its text", () => {
		it("leaves its timing and speaker alone", () => {
			const [stripped] = stripProfanity([
				passage([cue(4000, "That fucking coach screen")]),
			]);

			expect(stripped.cues[0]).toEqual({
				startMs: 4000,
				endMs: 6000,
				speaker: "Alice",
				text: "That coach screen",
			});
		});
	});
});
