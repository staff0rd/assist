import { describe, expect, it } from "vitest";
import { splitShellUrls } from "./splitShellUrls";

describe("splitShellUrls", () => {
	it("returns plain text as a single text segment", () => {
		expect(splitShellUrls("no links here\n")).toEqual([
			{ kind: "text", text: "no links here\n" },
		]);
	});

	it("splits a url in the middle of a line", () => {
		expect(splitShellUrls("see https://example.com/a?b=1 for more")).toEqual([
			{ kind: "text", text: "see " },
			{ kind: "url", text: "https://example.com/a?b=1" },
			{ kind: "text", text: " for more" },
		]);
	});

	it("splits a url at the end of a line", () => {
		expect(splitShellUrls("visit: https://example.com/x\nnext")).toEqual([
			{ kind: "text", text: "visit: " },
			{ kind: "url", text: "https://example.com/x" },
			{ kind: "text", text: "\nnext" },
		]);
	});

	it("keeps trailing punctuation outside the url", () => {
		expect(splitShellUrls("(go to https://example.com/path).")).toEqual([
			{ kind: "text", text: "(go to " },
			{ kind: "url", text: "https://example.com/path" },
			{ kind: "text", text: ")." },
		]);
	});

	it("splits several urls in one chunk", () => {
		expect(splitShellUrls("http://a.com and https://b.com/c")).toEqual([
			{ kind: "url", text: "http://a.com" },
			{ kind: "text", text: " and " },
			{ kind: "url", text: "https://b.com/c" },
		]);
	});
});
