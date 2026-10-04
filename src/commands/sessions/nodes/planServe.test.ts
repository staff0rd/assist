import { describe, expect, it } from "vitest";
import { planServe } from "./planServe";

const STATUS = {
	BackendState: "Running",
	CurrentTailnet: { MagicDNSSuffix: "tail1234.ts.net", MagicDNSEnabled: true },
	Self: { DNSName: "pc.tail1234.ts.net." },
};

describe("planServe", () => {
	it("serves the loopback web server on the same https port", () => {
		expect(planServe(STATUS, {}, 3101)).toEqual({
			host: "pc",
			url: "https://pc.tail1234.ts.net:3101",
			target: "http://127.0.0.1:3101",
			alreadyServing: false,
			args: ["serve", "--bg", "--https=3101", "http://127.0.0.1:3101"],
		});
	});

	it("serves on a separate https port when given one", () => {
		const plan = planServe(STATUS, {}, 3100, 4100);
		expect(plan.url).toBe("https://pc.tail1234.ts.net:4100");
		expect(plan.args).toEqual([
			"serve",
			"--bg",
			"--https=4100",
			"http://127.0.0.1:3100",
		]);
	});

	it("skips a port already proxied to the web server", () => {
		const config = {
			Web: {
				"pc.tail1234.ts.net:3101": {
					Handlers: { "/": { Proxy: "http://127.0.0.1:3101" } },
				},
				"pc.tail1234.ts.net:3100": {
					Handlers: { "/": { Proxy: "http://127.0.0.1:9999" } },
				},
			},
		};
		expect(planServe(STATUS, config, 3101).alreadyServing).toBe(true);
		expect(planServe(STATUS, config, 3100).alreadyServing).toBe(false);
	});

	it("rejects a stopped Tailscale", () => {
		expect(() =>
			planServe({ ...STATUS, BackendState: "Stopped" }, {}, 3100),
		).toThrow("Tailscale is not running");
	});
});
