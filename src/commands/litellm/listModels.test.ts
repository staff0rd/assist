import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./resolveLitellmConfig", () => ({
	resolveLitellmConfig: () => ({
		baseUrl: "https://proxy.example",
		apiKey: "sk-test",
	}),
}));

import { listModels, parseModelIds } from "./listModels";

describe("parseModelIds", () => {
	it("should sort the ids", () => {
		const body = JSON.stringify({
			data: [{ id: "sonnet" }, { id: "haiku" }, { id: "opus" }],
		});

		expect(parseModelIds(body)).toEqual(["haiku", "opus", "sonnet"]);
	});

	it("should ignore entries without a string id", () => {
		const body = JSON.stringify({ data: [{ id: "opus" }, {}, { id: 7 }] });

		expect(parseModelIds(body)).toEqual(["opus"]);
	});

	it("should return nothing when data is absent", () => {
		expect(parseModelIds("{}")).toEqual([]);
	});
});

describe("listModels", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;
	let exitSpy: ReturnType<typeof vi.spyOn>;
	const fetchMock = vi.fn();

	function logged(): string {
		return logSpy.mock.calls
			.map((call: unknown[]) => String(call[0]))
			.join("\n");
	}

	function errored(): string {
		return errorSpy.mock.calls
			.map((call: unknown[]) => String(call[0]))
			.join("\n");
	}

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", fetchMock);
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
			throw new Error(`exit:${code}`);
		}) as never);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		logSpy.mockRestore();
		errorSpy.mockRestore();
		exitSpy.mockRestore();
	});

	it("should request /v1/models with a bearer token and print sorted ids", async () => {
		fetchMock.mockResolvedValue(
			Response.json({ data: [{ id: "sonnet" }, { id: "haiku" }] }),
		);

		await listModels({});

		const [url, init] = fetchMock.mock.calls[0];
		expect(url).toBe("https://proxy.example/v1/models");
		expect(init.headers.Authorization).toBe("Bearer sk-test");
		expect(logged()).toBe("haiku\nsonnet");
	});

	it("should print the raw body for --json", async () => {
		const payload = { data: [{ id: "sonnet" }] };
		fetchMock.mockResolvedValue(Response.json(payload));

		await listModels({ json: true });

		expect(logged()).toBe(JSON.stringify(payload));
	});

	it("should report the status and body of a non-2xx response", async () => {
		fetchMock.mockResolvedValue(new Response("no key", { status: 401 }));

		await expect(listModels({})).rejects.toThrow("exit:1");
		expect(errored()).toContain("LiteLLM returned 401: no key");
	});

	it("should name the base URL when the request fails", async () => {
		fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

		await expect(listModels({})).rejects.toThrow("exit:1");
		expect(errored()).toContain(
			"Failed to reach LiteLLM at https://proxy.example: ECONNREFUSED",
		);
	});
});
