import type { IncomingMessage, ServerResponse } from "node:http";
import { describe, expect, it, vi } from "vitest";
import { allowAppOrigin } from "./allowAppOrigin";

function run(method: string, pathname: string, origin?: string) {
	const res = { setHeader: vi.fn(), writeHead: vi.fn(), end: vi.fn() };
	vi.spyOn(console, "log").mockImplementation(() => {});
	const handled = allowAppOrigin(
		{ method, headers: { origin } } as IncomingMessage,
		res as unknown as ServerResponse,
		pathname,
	);
	const allowOrigin = res.setHeader.mock.calls.find(
		([name]) => name === "Access-Control-Allow-Origin",
	)?.[1];
	return { handled, allowOrigin, res };
}

describe("allowAppOrigin", () => {
	it("allows the app origin on api requests without handling them", () => {
		const { handled, allowOrigin } = run(
			"GET",
			"/api/health",
			"capacitor://localhost",
		);
		expect(handled).toBe(false);
		expect(allowOrigin).toBe("capacitor://localhost");
	});

	it("answers the app's preflight", () => {
		const { handled, res } = run(
			"OPTIONS",
			"/api/config/set",
			"capacitor://localhost",
		);
		expect(handled).toBe(true);
		expect(res.writeHead).toHaveBeenCalledWith(204);
	});

	it("leaves other origins and non-api paths alone", () => {
		expect(run("GET", "/api/health", "https://evil.example").allowOrigin).toBe(
			undefined,
		);
		expect(run("GET", "/bundle.js", "capacitor://localhost").allowOrigin).toBe(
			undefined,
		);
	});
});
