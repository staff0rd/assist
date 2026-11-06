// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../../../../../designSystem/createDesignTheme";
import { NewSessionFooter } from "./NewSessionFooter";
import { FOOTER_HINTS } from "./NewSessionFooter/SubmitButton";

afterEach(cleanup);

function renderFooter() {
	render(
		<ThemeProvider theme={createDesignTheme("dark", "desktop")}>
			<NewSessionFooter submitLabel="Start" />
		</ThemeProvider>,
	);
	return {
		hints: screen.getByTestId("footer-hints"),
		start: screen.getByRole("button", { name: "Start" }),
	};
}

describe("NewSessionFooter", () => {
	it("groups every hint in a wrapping flex container", () => {
		const { hints } = renderFooter();
		for (const [, action] of FOOTER_HINTS)
			expect(hints.textContent).toContain(action);
		const style = getComputedStyle(hints);
		expect(style.display).toBe("flex");
		expect(style.flexWrap).toBe("wrap");
	});

	it("keeps Start outside the hints group as the footer's last, non-shrinking item", () => {
		const { hints, start } = renderFooter();
		expect(hints.contains(start)).toBe(false);
		const footer = hints.parentElement as HTMLElement;
		const startSlot = footer.lastElementChild as HTMLElement;
		expect(startSlot.contains(start)).toBe(true);
		expect(getComputedStyle(startSlot).flexShrink).toBe("0");
		expect(getComputedStyle(footer).alignItems).toBe("flex-end");
	});
});
