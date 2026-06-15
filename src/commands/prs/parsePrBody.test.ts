import { describe, expect, it } from "vitest";
import { parsePrBody, serializePrBody } from "./parsePrBody";

describe("parsePrBody", () => {
	it("splits a body into sections by heading", () => {
		const body = "## What\n\nDoes a thing\n\n## Why\n\nIt was needed";

		expect(parsePrBody(body)).toEqual([
			{ heading: "What", content: "Does a thing" },
			{ heading: "Why", content: "It was needed" },
		]);
	});

	it("preserves multi-paragraph and unknown sections", () => {
		const body =
			"## Why\n\ny\n\nResolves https://example/browse/BAD-1\n\n## Screenshots\n\n![img](url)";

		expect(parsePrBody(body)).toEqual([
			{ heading: "Why", content: "y\n\nResolves https://example/browse/BAD-1" },
			{ heading: "Screenshots", content: "![img](url)" },
		]);
	});

	it("ignores preamble before the first heading", () => {
		const body = "intro text\n\n## What\n\nx";

		expect(parsePrBody(body)).toEqual([{ heading: "What", content: "x" }]);
	});

	it("round-trips through serializePrBody", () => {
		const body = "## What\n\nx\n\n## Why\n\ny\n\n## How\n\nz";

		expect(serializePrBody(parsePrBody(body))).toBe(body);
	});
});
