import { describe, expect, it } from "vitest";
import { hasPhoneCaptureFlag } from "./hasPhoneCaptureFlag";
import { phoneCaptureFlag } from "./phoneCaptureFlag";

function storageWith(entries: Record<string, string>) {
	return { getItem: (key: string) => entries[key] ?? null };
}

describe("hasPhoneCaptureFlag", () => {
	it("is true when the capture flag is set", () => {
		expect(hasPhoneCaptureFlag(storageWith({ [phoneCaptureFlag]: "1" }))).toBe(
			true,
		);
	});

	it("is false without the flag", () => {
		expect(hasPhoneCaptureFlag(storageWith({}))).toBe(false);
	});

	it("is false when storage throws", () => {
		expect(
			hasPhoneCaptureFlag({
				getItem: () => {
					throw new Error("blocked");
				},
			}),
		).toBe(false);
	});
});
