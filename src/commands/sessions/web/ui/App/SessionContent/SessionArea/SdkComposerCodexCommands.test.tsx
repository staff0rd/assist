// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { makeSessionInfo } from "../../../../../../../test/mothers/makeSessionInfo";
import { SdkComposer } from "./SdkComposer";

const mockApiFetch = vi.fn();

vi.mock("../../../apiFetch", () => ({
	apiFetch: (url: string) => mockApiFetch(url),
}));

beforeAll(() => {
	Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	vi.clearAllMocks();
});

async function setup() {
	mockApiFetch.mockResolvedValue({
		json: async () => ({
			commands: [
				{ name: "commit", scope: "user" },
				{ name: "cook", scope: "project" },
				{ name: "draft", scope: "user" },
			],
		}),
	});
	const sendInput = vi.fn();
	const interruptSession = vi.fn();
	render(
		<SdkComposer
			session={makeSessionInfo({
				sdk: true,
				harness: "codex-sdk",
				cwd: "/repo",
				node: "work-wsl",
				status: "waiting",
			})}
			sendInput={sendInput}
			interruptSession={interruptSession}
		/>,
	);
	await waitFor(() => expect(mockApiFetch).toHaveBeenCalled());
	const field = screen.getByLabelText("Message Codex");
	fireEvent.change(field, {
		target: { value: "/co", selectionStart: 3, selectionEnd: 3 },
	});
	await screen.findByRole("listbox");
	return { field, sendInput, interruptSession };
}

const value = (field: HTMLElement) => (field as HTMLTextAreaElement).value;

describe("SdkComposer Codex SDK command lookup", () => {
	it("asks the session's node for the Codex harness's commands", async () => {
		await setup();
		const url = new URL(mockApiFetch.mock.calls[0][0], "http://localhost");
		expect(url.pathname).toBe("/api/slash-commands");
		expect(Object.fromEntries(url.searchParams)).toEqual({
			cwd: "/repo",
			harness: "codex-sdk",
			node: "work-wsl",
		});
	});

	it("lists matching commands for /co", async () => {
		await setup();
		expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
			"/commit",
			"/cookproject",
		]);
	});

	it("inserts the highlighted command on Enter without sending", async () => {
		const { field, sendInput } = await setup();
		fireEvent.keyDown(field, { key: "Enter" });
		expect(value(field)).toBe("/commit ");
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("inserts the highlighted command on Tab without sending", async () => {
		const { field, sendInput } = await setup();
		fireEvent.keyDown(field, { key: "ArrowDown" });
		fireEvent.keyDown(field, { key: "Tab" });
		expect(value(field)).toBe("/cook ");
		expect(sendInput).not.toHaveBeenCalled();
	});

	it("inserts a clicked command", async () => {
		const { field } = await setup();
		fireEvent.click(screen.getAllByRole("option")[0]);
		expect(value(field)).toBe("/commit ");
	});

	it("dismisses the list on Escape", async () => {
		const { field, interruptSession } = await setup();
		fireEvent.keyDown(field, { key: "Escape" });
		expect(screen.queryByRole("listbox")).toBeNull();
		expect(value(field)).toBe("/co");
		expect(interruptSession).not.toHaveBeenCalled();
	});
});
