// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { slateDesign } from "../../sessions/web/ui/designSystem/slateDesign";
import { ensureAssistButtonStyles } from "./ensureAssistButtonStyles";

afterEach(() => {
	document.head.innerHTML = "";
	vi.unstubAllGlobals();
	document.documentElement.removeAttribute("data-color-mode");
});

function css(): string {
	return (
		document.head.querySelector("[data-assist-send-style]")?.textContent ?? ""
	);
}

function expectSlate(mode: "light" | "dark") {
	const { color } = slateDesign[mode];
	expect(css()).toContain(`background: ${color.raised};`);
	expect(css()).toContain(`border: 1px solid ${color.line};`);
	expect(css()).toContain(`color: ${color.text.primary};`);
	expect(css()).toContain(`border-radius: ${slateDesign.radius.sm}px;`);
	expect(css()).toContain(`font-family: ${slateDesign.font.ui};`);
}

describe("ensureAssistButtonStyles", () => {
	it.each(["light", "dark"] as const)(
		"styles the button with Slate's %s tokens for GitHub's colour mode",
		(mode) => {
			document.documentElement.setAttribute("data-color-mode", mode);
			ensureAssistButtonStyles();
			expectSlate(mode);
		},
	);

	it("follows a colour mode switch", async () => {
		document.documentElement.setAttribute("data-color-mode", "light");
		ensureAssistButtonStyles();

		document.documentElement.setAttribute("data-color-mode", "dark");
		await Promise.resolve();

		expectSlate("dark");
	});

	it("falls back to the OS preference off GitHub", () => {
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: query === "(prefers-color-scheme: dark)",
		}));
		ensureAssistButtonStyles();
		expectSlate("dark");
	});
});
