import { describe, expect, it } from "vitest";
import { parseNetcapEntry } from "./parseNetcapEntry";

describe("parseNetcapEntry", () => {
	describe("when the body is a valid JSON object", () => {
		it("should return the parsed entry", () => {
			const entry = parseNetcapEntry(
				JSON.stringify({ url: "https://x.test", method: "GET", status: 200 }),
			);
			expect(entry).toEqual({
				url: "https://x.test",
				method: "GET",
				status: 200,
			});
		});
	});

	describe("when the body is not valid JSON", () => {
		it("should return null", () => {
			expect(parseNetcapEntry("not json")).toBeNull();
		});
	});

	describe("when the body is a JSON primitive", () => {
		it("should return null", () => {
			expect(parseNetcapEntry("42")).toBeNull();
		});
	});

	describe("when the body is JSON null", () => {
		it("should return null", () => {
			expect(parseNetcapEntry("null")).toBeNull();
		});
	});
});
