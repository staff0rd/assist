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

	it("uses https for local and remote sessions when configured", () => {
		expect(portUrl(5001, undefined, nodes, "https")).toEqual({
			url: "https://localhost:5001",
			remote: false,
		});
		expect(portUrl(5001, "Work-wsl", nodes, "https")).toEqual({
			url: "https://work-wsl.tail1234.ts.net:5001",
			remote: true,
		});
	});

	it("defaults to http when no protocol is configured", () => {
		expect(portUrl(5001, undefined, nodes, undefined).url).toBe(
			"http://localhost:5001",
		);
	});

	it("appends the path, adding a missing leading slash", () => {
		expect(portUrl(5173, undefined, nodes, undefined, "/swagger").url).toBe(
			"http://localhost:5173/swagger",
		);
		expect(portUrl(5173, undefined, nodes, undefined, "swagger").url).toBe(
			"http://localhost:5173/swagger",
		);
	});

	it("combines protocol and path for local and remote sessions", () => {
		expect(portUrl(5001, undefined, nodes, "https", "/app")).toEqual({
			url: "https://localhost:5001/app",
			remote: false,
		});
		expect(portUrl(5001, "Work-wsl", nodes, "https", "app")).toEqual({
			url: "https://work-wsl.tail1234.ts.net:5001/app",
			remote: true,
		});
	});

	it("falls back to localhost when the node is unknown", () => {
		expect(portUrl(5173, "Other", nodes).url).toBe("http://localhost:5173");
		expect(portUrl(5173, "Work-wsl", null).url).toBe("http://localhost:5173");
	});
});
