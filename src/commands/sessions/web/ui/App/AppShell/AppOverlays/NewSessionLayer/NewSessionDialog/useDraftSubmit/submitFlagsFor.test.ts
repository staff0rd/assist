import { describe, expect, it } from "vitest";
import { submitFlagsFor } from "./submitFlagsFor";

describe("submitFlagsFor", () => {
	it.each([
		[false, false, { open: false, yolo: false }],
		[false, true, { open: false, yolo: false }],
		[true, false, { open: true, yolo: false }],
		[true, true, { open: true, yolo: true }],
	])("shift=%s ctrl=%s → %o", (shiftKey, ctrlKey, flags) => {
		expect(submitFlagsFor({ shiftKey, ctrlKey })).toEqual(flags);
	});
});
