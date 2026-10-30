import { afterEach, describe, expect, it, vi } from "vitest";
import { runBrowserRequest } from "./runBrowserRequest";

const github = {
	id: 7,
	windowId: 1,
	active: true,
	url: "https://github.com/a/b",
};

function stubBrowser({
	decision,
	granted = true,
	execute = vi.fn(),
	sendMessage = vi
		.fn()
		.mockResolvedValue({ running: true, result: { decision } }),
}: {
	decision?: string;
	granted?: boolean;
	execute?: ReturnType<typeof vi.fn> | null;
	sendMessage?: ReturnType<typeof vi.fn>;
}) {
	const openOptionsPage = vi.fn().mockResolvedValue(undefined);
	vi.stubGlobal("browser", {
		runtime: { getManifest: () => ({ version: "1.0.0" }), openOptionsPage },
		tabs: { query: async () => [github], sendMessage },
		windows: { getLastFocused: async () => ({ id: 1 }) },
		permissions: { contains: async () => granted },
		userScripts: execute ? { execute } : {},
	});
	return { execute, sendMessage, openOptionsPage };
}

const run = () => runBrowserRequest({ op: "run", code: "return 1" });

describe("runBrowserRequest run", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("runs the script after the user clicks Run and returns its value", async () => {
		const execute = vi.fn().mockResolvedValue([{ result: { value: "1" } }]);
		const { sendMessage } = stubBrowser({ decision: "run", execute });
		await expect(run()).resolves.toEqual({
			ok: true,
			result: { tabUrl: github.url, outcome: "ran", value: "1" },
		});
		expect(sendMessage).toHaveBeenCalledWith(7, {
			op: "run",
			code: "return 1",
			type: "assist-browser-probe",
		});
		expect(execute).toHaveBeenCalledWith(
			expect.objectContaining({ target: { tabId: 7 } }),
		);
	});

	it("returns the script's error", async () => {
		const execute = vi
			.fn()
			.mockResolvedValue([{ result: { error: "TypeError: x" } }]);
		stubBrowser({ decision: "run", execute });
		await expect(run()).resolves.toMatchObject({
			ok: true,
			result: { outcome: "error", error: "TypeError: x" },
		});
	});

	it("returns an injection error such as a syntax error", async () => {
		const execute = vi.fn().mockResolvedValue([{ error: "SyntaxError" }]);
		stubBrowser({ decision: "run", execute });
		await expect(run()).resolves.toMatchObject({
			result: { outcome: "error", error: "SyntaxError" },
		});
	});

	it.each(["declined", "timeout"])(
		"does not execute when the decision is %s",
		async (decision) => {
			const { execute } = stubBrowser({ decision });
			await expect(run()).resolves.toEqual({
				ok: true,
				result: { tabUrl: github.url, outcome: decision },
			});
			expect(execute).not.toHaveBeenCalled();
		},
	);

	it("refuses without the userScripts permission and opens the options page", async () => {
		const { sendMessage, openOptionsPage } = stubBrowser({ granted: false });
		await expect(run()).resolves.toMatchObject({
			ok: false,
			error: expect.stringContaining("userScripts permission"),
		});
		expect(openOptionsPage).toHaveBeenCalled();
		expect(sendMessage).not.toHaveBeenCalled();
	});

	it("refuses when Firefox lacks userScripts.execute", async () => {
		stubBrowser({ execute: null });
		await expect(run()).resolves.toMatchObject({
			ok: false,
			error: expect.stringContaining("Firefox 153"),
		});
	});

	it("fails when the content script cannot show the panel", async () => {
		const { execute } = stubBrowser({
			sendMessage: vi.fn().mockRejectedValue(new Error("no receiver")),
		});
		await expect(run()).resolves.toMatchObject({
			ok: false,
			error: expect.stringContaining("content script is not running"),
		});
		expect(execute).not.toHaveBeenCalled();
	});
});
