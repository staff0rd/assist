import type { Browser } from "playwright";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InstanceAuth } from "./InstanceAuth";
import { signIn } from "./signIn";

const auth: InstanceAuth = {
	strategy: "login-script",
	script: "/repo/login.mjs",
	credentials: { username: "reviewer", password: "s3cret" },
};
const state = { cookies: [], origins: [] };

function fakeBrowser() {
	const page = { goto: vi.fn() };
	const context = {
		newPage: vi.fn().mockResolvedValue(page),
		storageState: vi.fn().mockResolvedValue(state),
		close: vi.fn().mockResolvedValue(undefined),
	};
	const browser = { newContext: vi.fn().mockResolvedValue(context) };
	return { browser: browser as unknown as Browser, context, page };
}

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("signIn", () => {
	it("opens no context when no auth is configured", async () => {
		const { browser } = fakeBrowser();
		expect(await signIn(browser, undefined, "http://x/")).toBeUndefined();
		expect(browser.newContext).not.toHaveBeenCalled();
	});

	it("runs the login script and hands back its storage state", async () => {
		const { browser, context, page } = fakeBrowser();
		const login = vi.fn();
		const result = await signIn(browser, auth, "http://x/", async (path) => {
			expect(path).toBe("/repo/login.mjs");
			return login;
		});
		expect(login).toHaveBeenCalledWith({
			page,
			url: "http://x/",
			credentials: { username: "reviewer", password: "s3cret" },
		});
		expect(result).toBe(state);
		expect(context.close).toHaveBeenCalled();
	});

	it("fails with the script's error and closes the context", async () => {
		const { browser, context } = fakeBrowser();
		await expect(
			signIn(browser, auth, "http://x/", async () => () => {
				throw new Error("no sign-in button");
			}),
		).rejects.toThrow("Sign-in with /repo/login.mjs failed: no sign-in button");
		expect(context.storageState).not.toHaveBeenCalled();
		expect(context.close).toHaveBeenCalled();
	});
});
