import { describe, expect, it } from "vitest";
import { createDesignTheme } from "./createDesignTheme";
import { slateDesign } from "./slateDesign";
import { slateDocSx } from "./slateDocSx";

const size = (sx: Record<string, unknown>, tag: string) =>
	(sx[`&& .markdown ${tag}`] as { fontSize: number }).fontSize;

describe("slateDocSx", () => {
	it.each(["desktop", "touch"] as const)(
		"reads %s doc text sizes from the theme tokens",
		(density) => {
			const sx = slateDocSx(createDesignTheme("dark", density));
			const { doc } = slateDesign.densities[density];
			const [h1, h2, h3] = ["h1", "h2", "h3"].map((tag) => size(sx, tag));

			expect(sx.fontSize).toBe(doc.body);
			expect([h1, h2, h3]).toEqual([doc.h1, doc.h2, doc.h3]);
			expect(sx.fontSize).toBeGreaterThan(14);
			expect(h1).toBeGreaterThan(h2);
			expect(h2).toBeGreaterThan(h3);
			expect(h3).toBeGreaterThan(doc.body);
		},
	);
});
