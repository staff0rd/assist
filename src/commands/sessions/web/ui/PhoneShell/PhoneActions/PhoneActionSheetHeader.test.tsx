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

function renderHeader(onParentClick = vi.fn()) {
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<div onClick={onParentClick}>
				<PhoneActionSheetHeader
					session={makeSessionInfo({ id: "42", cwd: "/home/me/repo" })}
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
});
