// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useDiffViewType } from "./useDiffViewType";

const KEY = "assist:diff-view-type";

function Probe() {
	const { viewType, onChange } = useDiffViewType();
	return (
		<button type="button" onClick={() => onChange("unified")}>
			{viewType}
		</button>
	);
}

function probe(): HTMLElement {
	return screen.getByRole("button");
}

beforeEach(() => {
	localStorage.clear();
});

afterEach(cleanup);

describe("useDiffViewType", () => {
	it("defaults to split with nothing stored", () => {
		render(<Probe />);

		expect(probe().textContent).toBe("split");
	});

	it("persists the chosen view type", () => {
		render(<Probe />);

		act(() => probe().click());

		expect(probe().textContent).toBe("unified");
		expect(localStorage.getItem(KEY)).toContain("unified");
	});

	it("restores the stored view type on a later mount", () => {
		render(<Probe />);
		act(() => probe().click());
		cleanup();

		render(<Probe />);

		expect(probe().textContent).toBe("unified");
	});

	it("shares the choice with every other diff on the page", () => {
		render(
			<>
				<Probe />
				<Probe />
			</>,
		);
		const [first, second] = screen.getAllByRole("button");
		if (!first || !second) throw new Error("expected two probes");

		act(() => first.click());
		cleanup();
		render(<Probe />);

		expect(probe().textContent).toBe("unified");
	});

	it("picks up a change made in another tab", () => {
		render(<Probe />);

		act(() => {
			localStorage.setItem(
				KEY,
				JSON.stringify({ savedAt: 1, items: ["unified"] }),
			);
			dispatchEvent(new StorageEvent("storage", { key: KEY }));
		});

		expect(probe().textContent).toBe("unified");
	});

	it("ignores storage events for unrelated keys", () => {
		render(<Probe />);

		act(() => {
			localStorage.setItem(
				KEY,
				JSON.stringify({ savedAt: 1, items: ["unified"] }),
			);
			dispatchEvent(new StorageEvent("storage", { key: "theme-mode" }));
		});

		expect(probe().textContent).toBe("split");
	});

	it("falls back to split when the stored value is not a view type", () => {
		localStorage.setItem(KEY, JSON.stringify({ savedAt: 1, items: ["sbs"] }));

		render(<Probe />);

		expect(probe().textContent).toBe("split");
	});
});
