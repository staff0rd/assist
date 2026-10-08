// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HighLevelStructureView } from "./HighLevelStructureView";
import { highLevelTreeFixture } from "./highLevelTreeFixture";

afterEach(cleanup);

function renderView() {
	render(
		<HighLevelStructureView
			subject="structure-nav-test"
			structure={{
				tree: highLevelTreeFixture,
				added: 0,
				removed: 0,
				modified: 3,
				additions: 3,
				deletions: 3,
			}}
		/>,
	);
}

function dialog() {
	return within(screen.getByRole("dialog"));
}

function button(name: string) {
	return dialog().getByRole("button", { name }) as HTMLButtonElement;
}

describe("HighLevelStructureView diff dialog", () => {
	it("steps forward and back through the files in tree order", () => {
		renderView();
		fireEvent.click(screen.getByLabelText("Show the diff of src/lib/util.ts"));

		expect(dialog().getByText("1 / 3")).toBeTruthy();
		expect(button("Previous").disabled).toBe(true);

		fireEvent.click(button("Next"));
		expect(dialog().getByText("src/app.ts")).toBeTruthy();
		expect(dialog().getByText("2 / 3")).toBeTruthy();

		fireEvent.click(button("Next"));
		expect(dialog().getByText("README.md")).toBeTruthy();
		expect(button("Next").disabled).toBe(true);

		fireEvent.click(button("Previous"));
		expect(dialog().getByText("src/app.ts")).toBeTruthy();
		expect(button("Previous").disabled).toBe(false);
	});

	it("steps into files under collapsed directories", () => {
		renderView();
		fireEvent.click(screen.getByLabelText("src"));
		fireEvent.click(screen.getByLabelText("Show the diff of README.md"));

		fireEvent.click(button("Previous"));

		expect(dialog().getByText("src/app.ts")).toBeTruthy();
		expect(dialog().getByText("2 / 3")).toBeTruthy();
	});
});
