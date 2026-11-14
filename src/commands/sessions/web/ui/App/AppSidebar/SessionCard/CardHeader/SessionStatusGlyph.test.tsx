// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionStatusGlyph } from "./SessionStatusGlyph";

afterEach(cleanup);

describe("SessionStatusGlyph", () => {
	it("draws a pulsing wrench head for a manual check", () => {
		render(<SessionStatusGlyph status="check" />);

		const glyph = screen.getByTitle("check");
		expect(glyph.querySelector("[data-testid='wrench-head']")).not.toBeNull();
		expect(glyph.textContent).toBe("");
		expect(getComputedStyle(glyph).animation).toContain("1.4s");
	});

	it("draws a pulsing eye for a design review", () => {
		render(<SessionStatusGlyph status="design" />);

		const glyph = screen.getByTitle("design");
		expect(glyph.querySelector("[data-testid='eye']")).not.toBeNull();
		expect(getComputedStyle(glyph).animation).toContain("1.4s");
	});

	it("keeps the text glyph for a question", () => {
		render(<SessionStatusGlyph status="question" />);

		expect(screen.getByTitle("question").textContent).toBe("?");
		expect(screen.queryByTestId("wrench-head")).toBeNull();
	});
});
