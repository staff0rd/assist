import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiUrl, apiWsUrl, setApiBase } from "./apiUrl";

describe("apiUrl", () => {
	beforeEach(() => {
		vi.stubGlobal("location", new URL("http://localhost:3100/sessions"));
	});

	afterEach(() => {
		setApiBase("");
		vi.unstubAllGlobals();
	});

	it("keeps paths on the current origin by default", () => {
		expect(apiUrl("/api/health")).toBe("/api/health");
		expect(apiWsUrl("/ws")).toBe("ws://localhost:3100/ws");
	});

	it("prefixes the configured home node", () => {
		setApiBase("https://mac.tail1234.ts.net:3100/");
		expect(apiUrl("/api/health")).toBe(
			"https://mac.tail1234.ts.net:3100/api/health",
		);
		expect(apiWsUrl("/ws")).toBe("wss://mac.tail1234.ts.net:3100/ws");
	});
});
