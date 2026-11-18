import { describe, expect, it } from "vitest";
import { formatTextSizeOffset } from "./formatTextSizeOffset";

describe("formatTextSizeOffset", () => {
	it("labels zero, positive and negative offsets", () => {
		expect(formatTextSizeOffset(0)).toBe("0");
		expect(formatTextSizeOffset(2)).toBe("+2");
		expect(formatTextSizeOffset(-1)).toBe("−1");
	});
});
