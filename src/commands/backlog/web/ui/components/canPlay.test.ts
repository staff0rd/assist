import { describe, expect, it } from "vitest";
import type { BacklogStatus } from "../types";
import { canPlay } from "./canPlay";

describe("canPlay", () => {
	it("is playable when todo", () => {
		expect(canPlay({ status: "todo" })).toBe(true);
	});

	it("is playable when in-progress", () => {
		expect(canPlay({ status: "in-progress" })).toBe(true);
	});

	it("is not playable when done", () => {
		expect(canPlay({ status: "done" })).toBe(false);
	});

	it("is not playable when wontdo", () => {
		expect(canPlay({ status: "wontdo" })).toBe(false);
	});

	it("does not depend on a plan", () => {
		const statuses: BacklogStatus[] = ["todo", "in-progress"];
		for (const status of statuses) {
			expect(canPlay({ status })).toBe(true);
		}
	});
});
