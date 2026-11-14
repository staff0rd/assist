// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createDesignTheme } from "../../../../../../../designSystem/createDesignTheme";
import { KnownSlashCommandsContext } from "../../../../../../../slashSuggestions/useKnownSlashCommands";
import { TextRowBody } from "./TextRowBody";

afterEach(cleanup);

function renderUserRow(text: string, term = "") {
	return render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<KnownSlashCommandsContext.Provider
				value={[{ name: "review", description: "", scope: "project" }]}
			>
				<TextRowBody isUser text={text} term={term} />
			</KnownSlashCommandsContext.Provider>
		</ThemeProvider>,
	).container;
}

describe("TextRowBody user rows", () => {
	it("renders markdown headings, lists, bold and inline code", () => {
		const container = renderUserRow(
			"Description:\n## Background\n\n- **one** `x`\n- two",
		);
		expect(container.querySelector("h2")?.textContent).toBe("Background");
		expect(container.querySelectorAll("li")).toHaveLength(2);
		expect(container.querySelector("strong")?.textContent).toBe("one");
		expect(container.querySelector("code")?.textContent).toBe("x");
	});

	it("renders known slash commands as chips, leaving unknown and code ones plain", () => {
		const container = renderUserRow("/review now, /other and `/review`");
		const chips = container.querySelectorAll(".slash-chip");
		expect(chips).toHaveLength(1);
		expect(chips[0].textContent).toBe("/review");
	});

	it("shows raw html as text", () => {
		const container = renderUserRow('<img src=x onerror="alert(1)">');
		expect(container.querySelector("img")).toBeNull();
		expect(container.textContent).toContain("<img");
	});

	it("falls back to plain highlighted text when a search term is active", () => {
		const container = renderUserRow("## Heading match", "match");
		expect(container.querySelector("h2")).toBeNull();
		expect(container.textContent).toBe("## Heading match");
		expect(container.querySelector("mark")?.textContent).toBe("match");
	});
});
