import { describe, expect, it } from "vitest";
import { createDesignTheme } from "../../../designSystem/createDesignTheme";
import { slateDesign } from "../../../designSystem/slateDesign";
import { reviewTypeDialogSx } from "./reviewTypeDialogSx";

describe("reviewTypeDialogSx", () => {
	it.each(["desktop", "touch"] as const)(
		"reads %s text sizes from the theme tokens",
		(density) => {
			const sx = reviewTypeDialogSx(createDesignTheme("dark", density));
			const { title, item, option } =
				slateDesign.densities[density].reviewDialog;

			expect(sx.title.fontSize).toBe(title);
			expect(sx.list["& .MuiMenuItem-root"].fontSize).toBe(item);
			expect(
				sx.list["& .MuiFormControlLabel-root .MuiFormControlLabel-label"]
					.fontSize,
			).toBe(option);
			expect(title).toBeGreaterThan(15);
			expect(item).toBeGreaterThan(13);
			expect(option).toBeGreaterThan(12);
		},
	);
});
