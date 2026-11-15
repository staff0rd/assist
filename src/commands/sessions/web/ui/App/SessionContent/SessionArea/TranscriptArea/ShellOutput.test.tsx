// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { SdkShellChunk } from "../../../../../../shared/SdkShellRow";
import { createDesignTheme } from "../../../../designSystem/createDesignTheme";
import { ShellOutput } from "./ShellOutput";

afterEach(cleanup);

const oauthUrl =
	"https://claude.com/cai/oauth/authorize?code=true&client_id=9d1c250a-e61b-44d9-88ed-5944d1962f5e&response_type=code&redirect_uri=https%3A%2F%2Fplatform.claude.com%2Foauth%2Fcode%2Fcallback&scope=org%3Acreate_api_key+user%3Aprofile+user%3Ainference&code_challenge=VL-pfNfKZ01xE6KvrgfCWfEDiKeFN9nFhAp7VnHZUAs&code_challenge_method=S256&state=JJEzTnCbebTvm--pdFz-mHAPz27QKXnQHpCxQn_H9kU";

function renderOutput(output: SdkShellChunk[]) {
	return render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<ShellOutput output={output} />
		</ThemeProvider>,
	);
}

describe("ShellOutput", () => {
	it("links a long oauth url in stdout, even when split across chunks", () => {
		const { container } = renderOutput([
			{ stream: "stdout", text: "Opening browser to sign in…\n" },
			{
				stream: "stdout",
				text: `If the browser didn't open, visit: ${oauthUrl.slice(0, 120)}`,
			},
			{ stream: "stdout", text: `${oauthUrl.slice(120)}.\n` },
		]);
		const link = screen.getByRole("link");
		expect(link.getAttribute("href")).toBe(oauthUrl);
		expect(link.textContent).toBe(oauthUrl);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toBe("noopener noreferrer");
		expect(container.querySelector("pre")?.textContent).toBe(
			`Opening browser to sign in…\nIf the browser didn't open, visit: ${oauthUrl}.\n`,
		);
	});

	it("keeps a stderr url inside the stderr span", () => {
		const { container } = renderOutput([
			{ stream: "stdout", text: "ok\n" },
			{ stream: "stderr", text: "error: see https://example.com/help)\n" },
		]);
		const spans = container.querySelectorAll("pre > span");
		expect(spans).toHaveLength(2);
		const link = screen.getByRole("link");
		expect(link.getAttribute("href")).toBe("https://example.com/help");
		expect(spans[1].contains(link)).toBe(true);
		expect(spans[1].textContent).toBe("error: see https://example.com/help)\n");
	});
});
