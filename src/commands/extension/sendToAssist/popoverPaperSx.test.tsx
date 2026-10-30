// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { slateDesign } from "../../sessions/web/ui/designSystem/slateDesign";
import { CriteriaTheme } from "../CriteriaTheme";
import { assistPopoverContent } from "./assistPopoverContent";

afterEach(() => {
	cleanup();
	document.documentElement.removeAttribute("data-color-mode");
});

function cssColor(color: string): string {
	const probe = document.createElement("div");
	probe.style.color = color;
	return probe.style.color;
}

describe("popoverPaperSx", () => {
	it.each([
		["instructions", "light"],
		["instructions", "dark"],
		["review", "light"],
		["review", "dark"],
	] as const)("frames the %s popover in Slate's %s overlay", (kind, mode) => {
		document.documentElement.setAttribute("data-color-mode", mode);
		const { container } = render(
			<CriteriaTheme>
				{assistPopoverContent(kind, { send: vi.fn(), dismiss: vi.fn() })}
			</CriteriaTheme>,
		);
		const paper = container.querySelector(".MuiPaper-root") as HTMLElement;
		const style = getComputedStyle(paper);
		const tokens = slateDesign[mode];
		expect(style.border).toBe(`1px solid ${cssColor(tokens.color.line)}`);
		expect(style.boxShadow).toBe(tokens.elevation.overlay);
		expect(style.backgroundColor).toBe(cssColor(tokens.color.surface));
	});
});
