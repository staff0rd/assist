// @vitest-environment jsdom
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionTextSizeTheme } from "./SessionTextSizeTheme";

afterEach(cleanup);

function Probe() {
	const theme = useTheme();
	return (
		<>
			<span data-testid="body2">{String(theme.typography.body2.fontSize)}</span>
			<span data-testid="spacing">{theme.spacing(2)}</span>
		</>
	);
}

describe("SessionTextSizeTheme", () => {
	it("adds the offset to typography variants and keeps the rest of the theme", () => {
		const outer = createTheme({
			typography: { body2: { fontSize: "0.875rem" } },
		});
		const { getByTestId } = render(
			<ThemeProvider theme={outer}>
				<SessionTextSizeTheme>
					<Probe />
				</SessionTextSizeTheme>
			</ThemeProvider>,
		);
		expect(getByTestId("body2").textContent).toBe(
			"calc(0.875rem + var(--session-text-offset, 0px))",
		);
		expect(getByTestId("spacing").textContent).toBe("16px");
	});
});
