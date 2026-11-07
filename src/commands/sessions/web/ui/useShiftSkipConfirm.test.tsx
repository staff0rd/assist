// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useShiftSkipConfirm } from "./useShiftSkipConfirm";

afterEach(cleanup);

function Harness({
	skip,
	needsConfirm,
	onOpen,
}: {
	skip: () => void;
	needsConfirm?: boolean;
	onOpen?: () => void;
}) {
	const { confirming, close, triggerHandlers, withHint } = useShiftSkipConfirm(
		skip,
		{ needsConfirm, onOpen },
	);
	return (
		<>
			<button type="button" title={withHint("Do it")} {...triggerHandlers}>
				trigger
			</button>
			{confirming && (
				<button type="button" onClick={close}>
					confirming
				</button>
			)}
		</>
	);
}

const trigger = () => screen.getByRole("button", { name: "trigger" });

describe("useShiftSkipConfirm", () => {
	it("opens the confirm on a plain click", () => {
		const skip = vi.fn();
		render(<Harness skip={skip} />);

		fireEvent.click(trigger());

		expect(screen.getByText("confirming")).toBeTruthy();
		expect(skip).not.toHaveBeenCalled();
	});

	it("skips the confirm on Shift-click", () => {
		const skip = vi.fn();
		render(<Harness skip={skip} />);

		fireEvent.click(trigger(), { shiftKey: true });

		expect(skip).toHaveBeenCalledOnce();
		expect(screen.queryByText("confirming")).toBeNull();
	});

	it("skips the confirm on Shift+Enter", () => {
		const skip = vi.fn();
		render(<Harness skip={skip} />);

		fireEvent.keyDown(trigger(), { key: "Enter", shiftKey: true });

		expect(skip).toHaveBeenCalledOnce();
	});

	it("ignores plain Enter so the native click opens the confirm", () => {
		const skip = vi.fn();
		render(<Harness skip={skip} />);

		fireEvent.keyDown(trigger(), { key: "Enter" });

		expect(skip).not.toHaveBeenCalled();
	});

	it("closes the confirm", () => {
		render(<Harness skip={() => {}} />);
		fireEvent.click(trigger());

		fireEvent.click(screen.getByText("confirming"));

		expect(screen.queryByText("confirming")).toBeNull();
	});

	it("runs the action directly when no confirm is needed", () => {
		const skip = vi.fn();
		render(<Harness skip={skip} needsConfirm={false} />);

		fireEvent.click(trigger());

		expect(skip).toHaveBeenCalledOnce();
		expect(screen.queryByText("confirming")).toBeNull();
	});

	it("hands a plain click to onOpen when the confirm lives elsewhere", () => {
		const onOpen = vi.fn();
		render(<Harness skip={() => {}} onOpen={onOpen} />);

		fireEvent.click(trigger());

		expect(onOpen).toHaveBeenCalledOnce();
	});

	it("appends the Shift hint to the trigger title", () => {
		render(<Harness skip={() => {}} />);

		expect(trigger().title).toBe("Do it (Shift skips confirmation)");
	});
});
