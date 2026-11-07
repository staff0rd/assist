import { describe, expect, it, vi } from "vitest";
import { ClientHub } from "./ClientHub";

describe("ClientHub.restartWebServers", () => {
	it("signals only log subscribers that registered as web servers", () => {
		const hub = new ClientHub();
		const web = { send: vi.fn() };
		const cli = { send: vi.fn() };
		hub.subscribeLogs(web, false, true);
		hub.subscribeLogs(cli, false);

		expect(hub.restartWebServers()).toBe(1);
		expect(web.send).toHaveBeenCalledWith(
			JSON.stringify({ type: "restart-webserver" }),
		);
		expect(cli.send).not.toHaveBeenCalled();
	});

	it("forgets a web server once it disconnects", () => {
		const hub = new ClientHub();
		const web = { send: vi.fn() };
		hub.subscribeLogs(web, false, true);
		hub.unsubscribeLogs(web);

		expect(hub.restartWebServers()).toBe(0);
	});
});
