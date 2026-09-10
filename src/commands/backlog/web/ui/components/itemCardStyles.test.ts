import { describe, expect, it } from "vitest";
import { itemCardStyles } from "./itemCardStyles";

const ring = {
	outline: "2px solid",
	outlineColor: "primary.main",
	outlineOffset: "2px",
};

function rules(key: keyof typeof itemCardStyles) {
	return itemCardStyles[key] as Record<string, unknown>;
}

describe("itemCardStyles focus rings", () => {
	it("rings the stretched row link", () => {
		expect(rules("stretchedNameLink")["&:focus-visible::after"]).toMatchObject(
			ring,
		);
	});

	it("rings every control in the meta line and the actions cluster", () => {
		for (const cluster of ["meta", "actions"] as const) {
			expect(
				rules(cluster)["& .MuiButtonBase-root:focus-visible"],
			).toMatchObject(ring);
		}
	});
});
