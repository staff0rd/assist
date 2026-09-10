// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SubtaskBadge } from "./SubtaskBadge";

afterEach(cleanup);

describe("SubtaskBadge", () => {
	it("shows the count with a plural label", () => {
		render(<SubtaskBadge count={3} />);

		expect(screen.getByLabelText("3 incomplete subtasks").textContent).toBe(
			"3",
		);
	});

	it("reads as singular for one subtask", () => {
		render(<SubtaskBadge count={1} />);

		expect(screen.getByLabelText("1 incomplete subtask")).toBeTruthy();
	});

	it("renders nothing when nothing is incomplete", () => {
		const { container } = render(<SubtaskBadge count={0} />);

		expect(container.firstChild).toBeNull();
	});
});
