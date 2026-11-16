// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../designSystem/createDesignTheme";
import { PhoneConversationIdChip } from "./PhoneConversationIdChip";

const id = "3f9a2c1e-7b4d-4e0a-9c2f-5d81e6a0b7c3";
const writeText = vi.fn(() => Promise.resolve());

beforeEach(() => {
	writeText.mockClear();
	Object.defineProperty(navigator, "clipboard", {
		value: { writeText },
		configurable: true,
	});
});

afterEach(cleanup);

function renderChip(harness?: "claude" | "codex") {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneConversationIdChip conversationId={id} harness={harness} />
		</ThemeProvider>,
	);
}

describe("PhoneConversationIdChip", () => {
	it("shows the harness label and short id", () => {
		renderChip("codex");
		const chip = screen.getByRole("button", {
			name: "Copy Codex session id 3f9a2c1e",
		});
		expect(chip.textContent).toBe("Codex3f9a2c1e");
	});

	it("defaults the label to Claude", () => {
		renderChip();
		expect(
			screen.getByRole("button", { name: "Copy Claude session id 3f9a2c1e" }),
		).toBeTruthy();
	});

	it("copies the full id and shows copied feedback", async () => {
		renderChip("claude");
		await act(async () => {
			fireEvent.click(screen.getByRole("button"));
		});
		expect(writeText).toHaveBeenCalledWith(id);
		const chip = screen.getByRole("button", {
			name: "Copied Claude session id",
		});
		expect(chip.textContent).toBe("Copied3f9a2c1e");
	});
});
