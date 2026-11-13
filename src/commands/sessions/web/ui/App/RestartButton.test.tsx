// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LabelledActionsContext } from "./useLabelledActionsContext";
import { RestartButton } from "./RestartButton";

afterEach(cleanup);

describe("RestartButton", () => {
	it.each([false, true])("starts over from the menu (shift=%s)", (shiftKey) => {
		const onStartOver = vi.fn();
		const onRestart = vi.fn();
		render(
			<RestartButton id="54" onRestart={onRestart} onStartOver={onStartOver} />,
		);
		fireEvent.click(screen.getByRole("button", { name: "Restart options" }));
		fireEvent.click(screen.getByRole("menuitem", { name: "Start over" }), {
			shiftKey,
		});
		if (!shiftKey) {
			expect(onStartOver).not.toHaveBeenCalled();
			expect(
				screen.getByText(/conversation history is discarded/),
			).toBeTruthy();
			fireEvent.click(screen.getByRole("button", { name: "Start over" }));
		}
		expect(onStartOver).toHaveBeenCalledOnce();
		expect(onRestart).not.toHaveBeenCalled();
	});

	it.each([false, true])(
		"joins both segments in one button group (labelled=%s)",
		(labelled) => {
			render(
				<LabelledActionsContext.Provider value={labelled}>
					<RestartButton id="54" onRestart={vi.fn()} onStartOver={vi.fn()} />
				</LabelledActionsContext.Provider>,
			);
			const group = screen.getByRole("group", { name: "Restart session" });
			expect(
				screen
					.getByRole("button", { name: "Restart" })
					.closest(".MuiButtonGroup-root"),
			).toBe(group);
			expect(
				screen
					.getByRole("button", { name: "Restart options" })
					.closest(".MuiButtonGroup-root"),
			).toBe(group);
		},
	);

	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		expect(screen.getByRole("button").title).toBe(
			"Restart session 54 (Shift skips confirmation)",
		);
	});

	it("restarts without confirming on Shift-click", () => {
		const onRestart = vi.fn();
		render(<RestartButton id="54" onRestart={onRestart} />);

		fireEvent.click(screen.getByRole("button"), { shiftKey: true });

		expect(onRestart).toHaveBeenCalledOnce();
		expect(screen.queryByRole("heading")).toBeNull();
	});

	it("restarts without confirming on Shift+Enter", () => {
		const onRestart = vi.fn();
		render(<RestartButton id="54" onRestart={onRestart} />);

		fireEvent.keyDown(screen.getByRole("button"), {
			key: "Enter",
			shiftKey: true,
		});

		expect(onRestart).toHaveBeenCalledOnce();
	});

	it("restarts after confirming a plain click", () => {
		const onRestart = vi.fn();
		render(<RestartButton id="54" onRestart={onRestart} />);

		fireEvent.click(screen.getByRole("button"));
		expect(onRestart).not.toHaveBeenCalled();
		fireEvent.click(screen.getByRole("button", { name: "Restart" }));

		expect(onRestart).toHaveBeenCalledOnce();
	});

	it("names the session id in the confirm dialog title", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByRole("heading").textContent).toBe("Restart session 54");
	});

	it("says a claude session resumes its conversation", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		fireEvent.click(screen.getByRole("button"));

		expect(
			screen.getByText(/Restart this Claude session/).textContent,
		).toContain("resumes the conversation");
	});

	it("says a codex session resumes its conversation", () => {
		render(<RestartButton id="54" onRestart={() => {}} harness="codex" />);

		fireEvent.click(screen.getByRole("button"));

		expect(
			screen.getByText(/Restart this Codex session/).textContent,
		).toContain("resumes the conversation");
	});

	it("says a pi session relaunches from the start", () => {
		render(<RestartButton id="54" onRestart={() => {}} harness="pi" />);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByText(/Restart this pi session/).textContent).toContain(
			"relaunches it from the start",
		);
	});
});
