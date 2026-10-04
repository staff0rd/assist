// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RepoPicker } from "./RepoPicker";

afterEach(cleanup);

function renderPicker() {
	render(
		<>
			<textarea aria-label="terminal" />
			<RepoPicker
				repos={["/repos/app"]}
				selected="/repos/app"
				onSelect={() => {}}
			/>
			<button type="button">next</button>
		</>,
	);
}

describe("RepoPicker", () => {
	it("Alt+R focuses the picker from the terminal and leaves Tab to move on", () => {
		renderPicker();
		const terminal = screen.getByLabelText("terminal");
		terminal.focus();

		const delivered = fireEvent.keyDown(terminal, {
			code: "KeyR",
			altKey: true,
		});

		const trigger = screen.getByRole("button", { name: "app" });
		expect(delivered).toBe(false);
		expect(document.activeElement).toBe(trigger);
		expect(fireEvent.keyDown(trigger, { key: "Tab" })).toBe(true);
	});

	it("shows the chord in the trigger's tooltip", async () => {
		renderPicker();

		fireEvent.mouseOver(screen.getByRole("button", { name: "app" }));

		const tooltip = await screen.findByRole("tooltip");
		await waitFor(() => expect(tooltip.textContent).toBe("RepoAlt+R"));
	});
});
