// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DiffFileRevertButton } from "./DiffFileRevertButton";

afterEach(cleanup);

const revertButton = { name: "Revert file" };

describe("DiffFileRevertButton", () => {
	it("reverts only after the confirmation is accepted", () => {
		const onRevert = vi.fn();
		render(
			<DiffFileRevertButton
				path="src/app.ts"
				added={false}
				onRevert={onRevert}
			/>,
		);

		fireEvent.click(screen.getByRole("button", revertButton));
		expect(onRevert).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("button", { name: "Revert" }));

		expect(onRevert).toHaveBeenCalledWith("src/app.ts");
	});

	it("does not revert when the confirmation is cancelled", () => {
		const onRevert = vi.fn();
		render(
			<DiffFileRevertButton
				path="src/app.ts"
				added={false}
				onRevert={onRevert}
			/>,
		);

		fireEvent.click(screen.getByRole("button", revertButton));
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

		expect(onRevert).not.toHaveBeenCalled();
		expect(screen.queryByRole("button", { name: "Revert" })).toBeNull();
	});

	it("warns that an added file will be deleted", () => {
		render(<DiffFileRevertButton path="src/new.ts" added onRevert={vi.fn()} />);

		fireEvent.click(screen.getByRole("button", revertButton));

		expect(screen.getByText(/deletes src\/new\.ts/)).toBeTruthy();
	});
});
