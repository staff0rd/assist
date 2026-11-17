// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ConfigEntry } from "../../../../../config/readConfigEntries";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { ConfigGroupCard } from "./ConfigGroupCard";

afterEach(cleanup);

const longNote =
	"globs (**/.github/workflows/**,**/.github/actions/**,**/package.json,**/Dockerfile,**/CLAUDE.md)";
const value = "**/locales/en-AU/translation.json,**/package.json";

function renderCard() {
	const theme = createDesignTheme("dark");
	const entry = {
		key: "review.highLevel.criticalPaths",
		type: "string",
		value,
		source: "repo",
		note: longNote,
	} as ConfigEntry;
	render(
		<ThemeProvider theme={theme}>
			<ConfigGroupCard
				group={{ name: "review", entries: [entry] }}
				cwd="/repo"
				onSaved={vi.fn()}
				onError={vi.fn()}
			/>
		</ThemeProvider>,
	);
	return theme;
}

describe("ConfigGroupCard", () => {
	it("keeps a long unbreakable note from squeezing the value column", () => {
		const theme = renderCard();

		expect(getComputedStyle(screen.getByRole("table")).tableLayout).toBe(
			"fixed",
		);
		const [keyCell, valueCell, sourceCell] = screen.getAllByRole("cell");
		expect(getComputedStyle(keyCell).width).toBe("35%");
		expect(getComputedStyle(valueCell).width).toBe("auto");
		expect(getComputedStyle(sourceCell).width).toBe(
			`${theme.tokens.density.configSourceColumnWidth}px`,
		);
		expect(getComputedStyle(screen.getByText(longNote)).overflowWrap).toBe(
			"anywhere",
		);
		expect(screen.getByText(value)).toBeTruthy();
	});
});
