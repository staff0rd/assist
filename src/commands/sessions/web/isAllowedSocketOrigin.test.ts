import type { IncomingMessage } from "node:http";
import { describe, expect, it } from "vitest";
import { isAllowedSocketOrigin } from "./isAllowedSocketOrigin";

function allowed(headers: Record<string, string | undefined>): boolean {
	return isAllowedSocketOrigin({ headers } as IncomingMessage);
}

describe("isAllowedSocketOrigin", () => {
	it("allows link daemons, which send no origin", () => {
		expect(allowed({ host: "127.0.0.1:3100" })).toBe(true);
	});

	it("allows the browser UI on its own origin", () => {
		expect(
			allowed({ host: "localhost:3100", origin: "http://localhost:3100" }),
		).toBe(true);
		expect(
			allowed({
				host: "127.0.0.1:3100",
				origin: "https://mac.tail1234.ts.net:3100",
				"x-forwarded-host": "mac.tail1234.ts.net:3100",
			}),
		).toBe(true);
	});

	it("allows the iOS app origin", () => {
		expect(
			allowed({
				host: "mac.tail1234.ts.net:3100",
				origin: "capacitor://localhost",
			}),
		).toBe(true);
	});

	it("refuses other cross-origin browsers", () => {
		expect(
			allowed({ host: "localhost:3100", origin: "https://evil.example" }),
		).toBe(false);
		expect(allowed({ host: "localhost:3100", origin: "null" })).toBe(false);
	});
});
