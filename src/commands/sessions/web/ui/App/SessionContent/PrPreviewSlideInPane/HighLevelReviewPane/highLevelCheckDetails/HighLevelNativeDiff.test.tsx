// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HighLevelNativeDiff } from "./HighLevelNativeDiff";

const patch = "@@ -1,2 +1,2 @@\n-const was = 1;\n+const now = 2;";

afterEach(cleanup);

function renderDiff(overrides: { patch?: string | null; truncated?: boolean }) {
	return render(
		<HighLevelNativeDiff
			path="src/app.ts"
			status="modified"
			patch={patch}
			viewType="unified"
			{...overrides}
		/>,
	);
}

describe("HighLevelNativeDiff", () => {
	it("renders the diff inside the themed container, so it is not stock react-diff-view colours", () => {
		const { container } = renderDiff({});

		const themed = container.querySelector(".diff")?.closest("[class*='css-']");

		expect(themed).not.toBeNull();
		expect(
			themed && getComputedStyle(themed).getPropertyValue("--diff-text-color"),
		).toBeTruthy();
	});

	it("highlights the code, so the tokens can be coloured", () => {
		const { container } = renderDiff({});

		expect(container.querySelector(".token")).not.toBeNull();
	});

	it("says where to read a diff it was given none of", () => {
		renderDiff({ patch: null });

		expect(screen.getByText(/No diff available/)).toBeTruthy();
	});

	it("says a capped diff continues on GitHub", () => {
		renderDiff({ truncated: true });

		expect(screen.getByText(/Truncated/)).toBeTruthy();
	});
});
