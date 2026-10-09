import { describe, expect, it } from "vitest";
import { toAttachments } from "./toAttachments";

describe("toAttachments", () => {
	it("keeps each attachment's group", () => {
		expect(
			toAttachments([
				{ path: "/s/a.png", alt: "light", group: "Profile" },
				{ path: "/s/b.png", alt: "drop", group: "" },
			]),
		).toEqual([
			{ path: "/s/a.png", alt: "light", group: "Profile" },
			{ path: "/s/b.png", alt: "drop" },
		]);
	});

	it("drops entries without a path", () => {
		expect(toAttachments([{ alt: "x" }, null])).toEqual([]);
	});

	it("returns undefined for a non-array", () => {
		expect(toAttachments("nope")).toBeUndefined();
	});
});
