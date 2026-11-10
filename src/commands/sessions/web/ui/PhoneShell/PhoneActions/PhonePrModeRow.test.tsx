// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PhonePrModeRow } from "./PhonePrModeRow";

afterEach(cleanup);

describe("PhonePrModeRow", () => {
	it("launches on the engine from the row and on another harness from its tap target", () => {
		const onLaunch = vi.fn();
		render(
			<PhonePrModeRow
				entry={{
					label: "Review & refine",
					args: ["review", "--refine"],
					alternates: [
						{
							harness: "codex",
							args: ["review", "--refine", "--harness", "codex"],
						},
					],
				}}
				onLaunch={onLaunch}
			/>,
		);

		fireEvent.click(screen.getByText("Review & refine"));
		fireEvent.click(
			screen.getByRole("button", { name: "Run Review & refine on Codex" }),
		);

		expect(onLaunch.mock.calls).toEqual([
			[["review", "--refine"]],
			[["review", "--refine", "--harness", "codex"]],
		]);
	});

	it("shows no harness tap target without alternates", () => {
		render(
			<PhonePrModeRow
				entry={{ label: "Review", args: ["review"], alternates: [] }}
				onLaunch={vi.fn()}
			/>,
		);

		expect(screen.getAllByRole("button")).toHaveLength(1);
	});
});
