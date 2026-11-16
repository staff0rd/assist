// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material/styles";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDesignTheme } from "../../designSystem/createDesignTheme";
import type { HistoricalSession } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneNewSessionSheet } from "./PhoneNewSessionSheet";

const configured = vi.hoisted(() => ({
	harnesses: {} as Record<string, string>,
	models: {} as Record<string, string>,
}));

vi.mock(
	"../../App/AppShell/AppOverlays/NewSessionLayer/useNewSessionDraft/useDefaultNewSessionMode",
	() => ({
		useDefaultNewSessionMode: () => ({
			mode: "prompt",
			harnesses: configured.harnesses,
			models: configured.models,
			pending: false,
		}),
	}),
);
vi.mock("../../useHarnessCapabilities", () => ({
	useHarnessCapabilities: () => ({
		exposeCodexActions: false,
		exposePiActions: false,
		engine: "claude",
		features: {
			draft: { claude: { available: true }, codex: { available: true } },
		},
	}),
}));

const apiFetch = vi.hoisted(() =>
	vi.fn(async (_url: string) => ({
		json: async () => ({
			commands: [
				{ name: "draft", scope: "user", description: "Draft an item" },
				{ name: "drift", scope: "project" },
				{ name: "commit", scope: "user" },
			],
		}),
	})),
);
vi.mock("../../apiFetch", () => ({ apiFetch }));

afterEach(() => {
	cleanup();
	apiFetch.mockClear();
	configured.harnesses = {};
	configured.models = {};
});

const origin = { origin: "github.com/x/assist" };
const history = [
	{ cwd: "/mac/assist", repoGroup: { ...origin, clone: "/mac/assist" } },
	{
		cwd: "/wsl/assist",
		node: "wsl",
		repoGroup: { ...origin, clone: "/wsl/assist" },
	},
] as HistoricalSession[];

function renderSheet() {
	const socket = {
		currentCwd: "/mac/assist",
		history,
		nodes: { local: "mac", links: [{ name: "wsl", state: "connected" }] },
		nodeSelection: { names: ["mac", "wsl"], visible: true },
		requestHistory: vi.fn(),
		createSession: vi.fn(),
		createDesignSession: vi.fn(),
		createHarnessSession: vi.fn(),
		createAssistSession: vi.fn(),
	} as unknown as SessionSocket;
	const onClose = vi.fn();
	render(
		<ThemeProvider theme={createDesignTheme("dark")}>
			<PhoneNewSessionSheet open opens={1} onClose={onClose} socket={socket} />
		</ThemeProvider>,
	);
	return { socket, onClose };
}

describe("PhoneNewSessionSheet", () => {
	it("starts a draft on a linked node in that node's clone", () => {
		const { socket, onClose } = renderSheet();

		fireEvent.click(screen.getByRole("radio", { name: "Draft" }));
		fireEvent.click(screen.getByRole("radio", { name: /wsl/ }));
		fireEvent.change(screen.getByRole("textbox", { name: "Prompt" }), {
			target: { value: "Phone drafts" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Start draft" }));

		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "claude", "--no-model", "Phone drafts"],
			"/wsl/assist",
			{ node: "wsl" },
		);
		expect(onClose).toHaveBeenCalled();
	});

	it("starts a draft on the draft type's configured harness", () => {
		configured.harnesses = { draft: "codex" };
		const { socket } = renderSheet();

		fireEvent.click(screen.getByRole("radio", { name: "Draft" }));
		fireEvent.click(screen.getByRole("radio", { name: /wsl/ }));
		fireEvent.click(screen.getByRole("button", { name: "Start draft" }));

		expect(socket.createAssistSession).toHaveBeenCalledWith(
			["draft", "--once", "--harness", "codex", "--no-model"],
			"/wsl/assist",
			{ node: "wsl" },
		);
	});

	it("preselects prompt's configured model and starts on a hand-picked one", () => {
		configured.harnesses = { prompt: "claude" };
		configured.models = { prompt: "opus" };
		const { socket } = renderSheet();
		const model = screen.getByRole("radiogroup", { name: "Model" });

		expect(
			within(model)
				.getByRole("radio", { name: "opus" })
				.getAttribute("aria-checked"),
		).toBe("true");
		fireEvent.click(within(model).getByRole("radio", { name: "sonnet" }));
		fireEvent.click(screen.getByRole("button", { name: "Start session" }));

		expect(socket.createHarnessSession).toHaveBeenCalledWith(
			"claude",
			"",
			"/mac/assist",
			"mac",
			undefined,
			"sonnet",
		);
	});

	it("lists matching skills under the prompt and fills the picked one", async () => {
		renderSheet();
		const prompt = screen.getByRole("textbox", {
			name: "Prompt",
		}) as HTMLTextAreaElement;
		await waitFor(() =>
			expect(apiFetch).toHaveBeenCalledWith(
				expect.stringContaining("cwd=%2Fmac%2Fassist"),
			),
		);

		fireEvent.change(prompt, { target: { value: "/dr" } });
		fireEvent.select(prompt, { target: { selectionEnd: 3 } });
		const list = await screen.findByRole("listbox", {
			name: "Skill suggestions",
		});
		expect(within(list).getAllByRole("option")).toHaveLength(2);
		expect(
			prompt.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			list.compareDocumentPosition(
				screen.getByRole("button", { name: /assist/ }),
			) & Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();

		fireEvent.click(within(list).getByRole("option", { name: /draft/ }));

		expect(prompt.value).toBe("/draft ");
		expect(screen.queryByRole("listbox")).toBeNull();
	});

	it("suggests no skills for a harness without slash suggestions", async () => {
		configured.harnesses = { draft: "codex" };
		renderSheet();
		fireEvent.click(screen.getByRole("radio", { name: "Draft" }));
		await waitFor(() => expect(apiFetch).toHaveBeenCalled());
		const prompt = screen.getByRole("textbox", { name: "Prompt" });

		fireEvent.change(prompt, { target: { value: "/dr" } });
		fireEvent.select(prompt, { target: { selectionEnd: 3 } });

		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(screen.queryByRole("listbox")).toBeNull();
	});
});
