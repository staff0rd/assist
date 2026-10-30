// @vitest-environment jsdom
import { useTheme } from "@mui/material";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { slateDesign } from "../sessions/web/ui/designSystem/slateDesign";
import { CriteriaTheme } from "./CriteriaTheme";

function ShowMode() {
	const { palette, typography } = useTheme();
	return (
		<>
			<span>{palette.mode}</span>
			<span data-testid="paper">{palette.background.paper}</span>
			<span data-testid="primary">{palette.primary.main}</span>
			<span data-testid="font">{typography.fontFamily}</span>
		</>
	);
}

function expectSlate(mode: "light" | "dark") {
	const { color } = slateDesign[mode];
	expect(screen.getByText(mode)).toBeDefined();
	expect(screen.getByTestId("paper").textContent).toBe(color.surface);
	expect(screen.getByTestId("primary").textContent).toBe(color.primary.main);
	expect(screen.getByTestId("font").textContent).toBe(slateDesign.font.ui);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	for (const name of ["data-color-mode", "data-light-theme", "data-dark-theme"])
		document.documentElement.removeAttribute(name);
});

function open() {
	render(
		<CriteriaTheme>
			<ShowMode />
		</CriteriaTheme>,
	);
}

async function setColorMode(mode: string) {
	await act(async () => {
		document.documentElement.setAttribute("data-color-mode", mode);
	});
}

describe("CriteriaTheme", () => {
	it.each(["light", "dark"] as const)(
		"starts in Slate's %s theme for GitHub's current colour mode",
		(mode) => {
			document.documentElement.setAttribute("data-color-mode", mode);
			open();
			expectSlate(mode);
		},
	);

	it("follows a colour mode switch while the outline is open", async () => {
		document.documentElement.setAttribute("data-color-mode", "light");
		open();

		await setColorMode("dark");

		expectSlate("dark");
	});

	it("falls back to the OS preference off GitHub", () => {
		vi.stubGlobal("matchMedia", (query: string) => ({
			matches: query === "(prefers-color-scheme: dark)",
		}));
		open();
		expectSlate("dark");
	});
});
