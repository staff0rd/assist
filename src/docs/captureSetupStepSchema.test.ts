import { describe, expect, it } from "vitest";
import { captureSetupStepSchema } from "./captureSetupStepSchema";

describe("captureSetupStepSchema connectMobile", () => {
	const parses = (connectMobile: unknown) =>
		captureSetupStepSchema.safeParse({ connectMobile }).success;

	it("accepts a tailnet url and node name", () => {
		expect(
			parses({ url: "https://mac.tail1234.ts.net:3100", name: "mac" }),
		).toBe(true);
	});

	it("rejects a missing or non-url url, an empty name, or extra keys", () => {
		expect(parses({ name: "mac" })).toBe(false);
		expect(parses({ url: "mac.tail1234.ts.net", name: "mac" })).toBe(false);
		expect(parses({ url: "https://mac.tail1234.ts.net:3100", name: "" })).toBe(
			false,
		);
		expect(
			parses({
				url: "https://mac.tail1234.ts.net:3100",
				name: "mac",
				ok: false,
			}),
		).toBe(false);
	});
});
