import { describe, expect, it } from "vitest";
import { formatAskCheckAnswer } from "./formatAskCheckAnswer";

describe("formatAskCheckAnswer", () => {
	it("reports the user's result and note", () => {
		expect(
			formatAskCheckAnswer("It works", { result: "works", note: "ok" }),
		).toBe('Manual check "It works": works\nNote: ok');
	});

	it("says a yolo answer came from yolo mode", () => {
		expect(formatAskCheckAnswer("It works", { result: "works" }, "yolo")).toBe(
			'Manual check "It works": works (marked Works by yolo mode; the user did not see it)',
		);
	});
});
