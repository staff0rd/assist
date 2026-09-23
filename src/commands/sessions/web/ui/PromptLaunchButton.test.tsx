// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromptLaunchButton } from "./PromptLaunchButton";

function mockHarness(capabilities: {
	exposeCodexActions?: boolean;
	exposePiActions?: boolean;
}) {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue({ json: () => Promise.resolve(capabilities) }),
	);
}

function renderButton(handlers: {
	onCreate: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
}) {
	return render(
		<PromptLaunchButton
			cwd="/git/repo"
			disabled={false}
			onCreate={handlers.onCreate}
			onCreateHarness={handlers.onCreateHarness}
		/>,
	);
}

function openComposer() {
	fireEvent.click(screen.getByRole("button", { name: "prompt options" }));
}

function clickLabel() {
	fireEvent.click(screen.getByRole("button", { name: "prompt" }));
}

function typeAndSubmit(prompt: string) {
	fireEvent.change(screen.getByRole("textbox"), { target: { value: prompt } });
	fireEvent.click(screen.getByRole("button", { name: "Start" }));
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("PromptLaunchButton", () => {
	it("launches Claude with no harness selector when nothing else is on PATH", async () => {
		mockHarness({ exposeCodexActions: false, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		await waitFor(() => expect(fetch).toHaveBeenCalled());
		expect(screen.queryAllByRole("radio")).toHaveLength(0);
		typeAndSubmit("go");

		expect(onCreate).toHaveBeenCalledWith("go", "/git/repo");
		expect(onCreateHarness).not.toHaveBeenCalled();
	});

	it("launches the selected harness when codex is exposed", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		const codex = await screen.findByRole("radio", { name: "Codex" });
		fireEvent.click(codex);
		typeAndSubmit("go");

		expect(onCreateHarness).toHaveBeenCalledWith("codex", "go", "/git/repo");
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("keeps focus in the prompt box when a harness label is pressed", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		await screen.findByRole("radio", { name: "Codex" });
		const label = screen.getByText("Codex");
		expect(fireEvent.mouseDown(label)).toBe(false);
		fireEvent.click(label);
		typeAndSubmit("go");

		expect(onCreateHarness).toHaveBeenCalledWith("codex", "go", "/git/repo");
	});

	it("still launches Claude when Claude stays selected", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: true });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		await screen.findByRole("radio", { name: "Codex" });
		typeAndSubmit("go");

		expect(onCreate).toHaveBeenCalledWith("go", "/git/repo");
		expect(onCreateHarness).not.toHaveBeenCalled();
	});

	it("launches with an empty prompt when the label half is clicked", () => {
		mockHarness({ exposeCodexActions: false, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		clickLabel();

		expect(onCreate).toHaveBeenCalledWith("", "/git/repo");
		expect(onCreateHarness).not.toHaveBeenCalled();
		expect(screen.queryByRole("textbox")).toBeNull();
	});

	it("opens the prompt form when the chevron half is clicked", () => {
		mockHarness({ exposeCodexActions: false, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();

		expect(screen.getByRole("textbox")).toBeTruthy();
		expect(onCreate).not.toHaveBeenCalled();
	});

	it("keeps the harness picked in the dropdown for the label half", async () => {
		mockHarness({ exposeCodexActions: true, exposePiActions: false });
		const onCreate = vi.fn();
		const onCreateHarness = vi.fn();
		renderButton({ onCreate, onCreateHarness });

		openComposer();
		fireEvent.click(await screen.findByRole("radio", { name: "Codex" }));
		typeAndSubmit("go");
		clickLabel();

		expect(onCreateHarness).toHaveBeenNthCalledWith(
			1,
			"codex",
			"go",
			"/git/repo",
		);
		expect(onCreateHarness).toHaveBeenNthCalledWith(
			2,
			"codex",
			"",
			"/git/repo",
		);
		expect(onCreate).not.toHaveBeenCalled();
	});
});
