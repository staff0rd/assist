// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../test/mothers/makeSessionInfo";
import type { SessionInfo } from "../../types";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import { PhoneActionSheetHeader } from "./PhoneActionSheetHeader";

afterEach(() => {
	cleanup();
	Reflect.deleteProperty(navigator, "clipboard");
});

function stubClipboard() {
	const writeText = vi.fn(async () => {});
	Object.defineProperty(navigator, "clipboard", {
		configurable: true,
		value: { writeText },
	});
	return writeText;
}

function renderHeader(
	onParentClick = vi.fn(),
	overrides: Partial<SessionInfo> = {},
) {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<div onClick={onParentClick}>
				<PhoneActionSheetHeader
					session={makeSessionInfo({
						id: "42",
						cwd: "/home/me/repo",
						...overrides,
					})}
					localNode="laptop"
				/>
			</div>
		</ThemeProvider>,
	);
	return onParentClick;
}

describe("PhoneActionSheetHeader", () => {
	it("ends the subtitle with the session id", () => {
		renderHeader();
		expect(screen.getByRole("button").textContent).toBe("#42");
		expect(screen.getByText(/repo · laptop/)).toBeTruthy();
	});

	it("copies the bare id on tap and confirms without bubbling", async () => {
		const writeText = stubClipboard();
		const onParentClick = renderHeader();
		fireEvent.click(screen.getByRole("button", { name: /copy session id/i }));
		expect(writeText).toHaveBeenCalledWith("42");
		await waitFor(() => expect(screen.getByText("Copied")).toBeTruthy());
		expect(onParentClick).not.toHaveBeenCalled();
	});

	it("hides the conversation id chip until the harness reports an id", () => {
		renderHeader();
		expect(screen.queryByRole("button", { name: /Claude session id/ })).toBe(
			null,
		);
	});

	it("shows the harness-labelled conversation id chip and copies the full id", async () => {
		const writeText = stubClipboard();
		const onParentClick = renderHeader(vi.fn(), {
			harness: "codex",
			harnessSessionId: "3f9a2c1e-7b4d-4e0a-9c2f-5d81e6a0b7c3",
		});
		fireEvent.click(
			screen.getByRole("button", { name: "Copy Codex session id 3f9a2c1e" }),
		);
		expect(writeText).toHaveBeenCalledWith(
			"3f9a2c1e-7b4d-4e0a-9c2f-5d81e6a0b7c3",
		);
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: "Copied Codex session id" }),
			).toBeTruthy(),
		);
		expect(
			screen.getByRole("button", { name: /copy session id/i }).textContent,
		).toBe("#42");
		expect(onParentClick).not.toHaveBeenCalled();
	});

	it("falls back to the claude session id", () => {
		renderHeader(vi.fn(), { claudeSessionId: "abcdef0123456789" });
		expect(
			screen.getByRole("button", { name: "Copy Claude session id abcdef01" }),
		).toBeTruthy();
	});
});
