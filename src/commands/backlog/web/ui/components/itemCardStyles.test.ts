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

describe("itemCardStyles sweeping edge", () => {
	it("sweeps a dash down a transparent left border while running", () => {
		const running = rules("inProgressRunningCard");

		expect(running.borderLeftColor).toBe("transparent");
		expect(running.borderLeft).toBe(4);
		expect(String(running.animation)).toContain("0.9s linear infinite");
		expect(running.backgroundOrigin).toBe("border-box");
		expect(running.backgroundRepeat).toBe("repeat-y");
		expect(running.backgroundSize).toBe("4px 24px");
	});

	it("holds the dashes still under prefers-reduced-motion", () => {
		expect(
			rules("inProgressRunningCard")["@media (prefers-reduced-motion: reduce)"],
		).toEqual({ animation: "none" });
	});

	it("leaves the idle in-progress card solid and unanimated", () => {
		const idle = rules("inProgressCard");

		expect(idle.borderLeftColor).toBe("warning.main");
		expect(idle.animation).toBeUndefined();
		expect(idle.backgroundImage).toBeUndefined();
	});

	it("keeps the running card on the same grid as the idle one", () => {
		const idle = rules("inProgressCard");
		const running = rules("inProgressRunningCard");

		for (const key of [
			"display",
			"gridTemplateColumns",
			"columnGap",
			"p",
			"mb",
			"borderRadius",
			"border",
			"borderLeft",
		] as const) {
			expect(running[key]).toEqual(idle[key]);
		}
	});
});
