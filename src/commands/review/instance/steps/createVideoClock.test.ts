import { describe, expect, it } from "vitest";
import { createVideoClock } from "./createVideoClock";
import { formatVideoOffset } from "./formatVideoOffset";

describe("createVideoClock", () => {
	it("gives each call's offset from when recording started", () => {
		const times = [1_000, 1_000, 13_500, 75_250];
		const offset = createVideoClock(true, () => times.shift() ?? 0);
		expect([offset(), offset(), offset()]).toEqual([0, 12_500, 74_250]);
	});

	it("gives no offset when not recording", () => {
		expect(createVideoClock(false, () => 5)()).toBeUndefined();
	});
});

describe("formatVideoOffset", () => {
	it("formats milliseconds as m:ss", () => {
		expect(formatVideoOffset(0)).toBe("0:00");
		expect(formatVideoOffset(12_500)).toBe("0:12");
		expect(formatVideoOffset(74_250)).toBe("1:14");
	});
});
