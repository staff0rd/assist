// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HighLevelManualTesting } from "./HighLevelManualTesting";

afterEach(cleanup);

describe("HighLevelManualTesting", () => {
	it("shows setup chips then numbered action → expected steps with links", () => {
		render(
			<HighLevelManualTesting
				repo="org/repo"
				headSha="abc"
				manualTesting={{
					setup: ["Restart the web server"],
					steps: [
						{
							action: "Open http://localhost:3000/review",
							expect: "The Manual testing item shows",
						},
						{ action: "Read src/a.ts", expect: "It exports a" },
					],
				}}
			/>,
		);

		expect(
			within(screen.getByRole("group", { name: "Setup" })).getByText(
				"Restart the web server",
			),
		).toBeTruthy();
		const steps = within(
			screen.getByRole("list", { name: "Manual testing steps" }),
		).getAllByRole("listitem");
		expect(steps.map((step) => step.textContent)).toEqual([
			"Open http://localhost:3000/review→The Manual testing item shows",
			"Read src/a.ts→It exports a",
		]);
		const url = screen.getByRole("link", {
			name: "http://localhost:3000/review",
		});
		expect(url.getAttribute("target")).toBe("_blank");
		expect(
			screen.getByRole("link", { name: "src/a.ts" }).getAttribute("href"),
		).toBe("https://github.com/org/repo/blob/abc/src/a.ts");
	});

	it("asks for a re-run when saved slices predate manual testing", () => {
		render(
			<HighLevelManualTesting
				repo="org/repo"
				headSha="abc"
				manualTesting={undefined}
			/>,
		);

		expect(
			screen.getByText("No manual testing steps — re-run with --force"),
		).toBeTruthy();
	});
});
