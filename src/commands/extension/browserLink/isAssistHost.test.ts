import { describe, expect, it } from "vitest";
import { isAssistHost } from "./isAssistHost";

describe("isAssistHost", () => {
	it("accepts the hosts the assist content scripts run on", () => {
		expect(isAssistHost("https://github.com/a/b")).toBe(true);
		expect(isAssistHost("https://dev.azure.com/o/p")).toBe(true);
		expect(isAssistHost("https://org.visualstudio.com/p")).toBe(true);
		expect(isAssistHost("http://localhost:4173/docs")).toBe(true);
		expect(isAssistHost("http://127.0.0.1:4173/")).toBe(true);
	});

	it("accepts a docs preview opened by a non-localhost http hostname", () => {
		expect(
			isAssistHost(
				"http://staffords-macbook-pro.tail5881bf.ts.net:4173/sessions-session-area/",
			),
		).toBe(true);
		expect(isAssistHost("http://192.168.1.20:4173/")).toBe(true);
	});

	it("rejects other tabs", () => {
		expect(isAssistHost(undefined)).toBe(false);
		expect(isAssistHost("about:newtab")).toBe(false);
		expect(isAssistHost("file:///tmp/a.html")).toBe(false);
		expect(isAssistHost("https://gist.github.com/x")).toBe(false);
		expect(isAssistHost("https://localhost/")).toBe(false);
		expect(isAssistHost("https://evilvisualstudio.com/")).toBe(false);
	});
});
