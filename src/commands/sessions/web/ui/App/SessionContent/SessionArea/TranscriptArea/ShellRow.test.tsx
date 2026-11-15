// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../../../designSystem/createDesignTheme";
import { ShellRow } from "./ShellRow";

afterEach(cleanup);

function renderRow(status: "running" | "held" | "sent", onDiscard = vi.fn()) {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<ShellRow
				command="git status"
				output={[]}
				status={status}
				startedAt={Date.now()}
				exitCode={0}
				durationMs={10}
				onStop={vi.fn()}
				onDiscard={onDiscard}
			/>
		</ThemeProvider>,
	);
	return onDiscard;
}

const closeButton = () =>
	screen.queryByRole("button", { name: "Discard result of git status" });

describe("ShellRow", () => {
	it("discards a held result from its close button", () => {
		const onDiscard = renderRow("held");
		fireEvent.click(closeButton() as HTMLElement);
		expect(onDiscard).toHaveBeenCalledOnce();
	});

	it("shows no close button while running or once sent", () => {
		renderRow("running");
		expect(closeButton()).toBeNull();
		cleanup();
		renderRow("sent");
		expect(closeButton()).toBeNull();
	});
});
