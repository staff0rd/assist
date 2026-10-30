import { describe, expect, it } from "vitest";
import { portUrl } from "./portUrl";

const nodes = {
	local: "mac",
	links: [
		{
			name: "Work-wsl",
			url: "https://work-wsl.tail1234.ts.net:7443",
			state: "connected" as const,
		},
	],
};

describe("portUrl", () => {
	it("opens localhost for a local session", () => {
		expect(portUrl(5173, undefined, nodes)).toEqual({
			url: "http://localhost:5173",
			remote: false,
		});
		expect(portUrl(5173, "mac", nodes).url).toBe("http://localhost:5173");
	});

	it("opens the linked node's tailnet host for a remote session", () => {
		expect(portUrl(5173, "Work-wsl", nodes)).toEqual({
			url: "http://work-wsl.tail1234.ts.net:5173",
			remote: true,
		});
	});

	it("falls back to localhost when the node is unknown", () => {
		expect(portUrl(5173, "Other", nodes).url).toBe("http://localhost:5173");
		expect(portUrl(5173, "Work-wsl", null).url).toBe("http://localhost:5173");
	});
});
