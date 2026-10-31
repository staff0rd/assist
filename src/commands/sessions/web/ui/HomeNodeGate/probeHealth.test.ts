// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	clearClientFailures,
	getClientFailures,
} from "../clientFailures/recordClientFailure";
import { probeHealth } from "./probeHealth";

afterEach(() => {
	clearClientFailures();
	vi.unstubAllGlobals();
});

describe("probeHealth", () => {
	it("reports a failed probe against the probed node", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("", { status: 503 })),
		);
		const result = await probeHealth("https://mac.ts.net:3100");
		expect(result).toMatchObject({ ok: false, error: "HTTP 503" });
		expect(getClientFailures()[0]).toMatchObject({
			method: "GET",
			path: "/api/health",
			base: "https://mac.ts.net:3100",
			status: 503,
		});
	});

	it("does not report a healthy node", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => Response.json({ nodeName: "mac" })),
		);
		const result = await probeHealth("https://mac.ts.net:3100");
		expect(result).toEqual({ ok: true, health: { nodeName: "mac" } });
		expect(getClientFailures()).toHaveLength(0);
	});
});
