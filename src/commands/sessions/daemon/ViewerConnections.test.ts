import { describe, expect, it } from "vitest";
import type { SessionClient } from "./broadcast";
import { ViewerConnections } from "./ViewerConnections";

const client = (): SessionClient => ({ send: () => {} });

describe("ViewerConnections", () => {
	it("releases every viewer a closing connection held", () => {
		const viewers = new ViewerConnections();
		const tab = client();
		viewers.track(tab, "a");
		viewers.track(tab, "b");

		expect(viewers.releaseUnheld(tab)).toEqual(["a", "b"]);
		expect(viewers.releaseUnheld(tab)).toEqual([]);
	});

	it("keeps a viewer another connection still holds", () => {
		const viewers = new ViewerConnections();
		const oldTab = client();
		const reloaded = client();
		viewers.track(oldTab, "a");
		viewers.track(reloaded, "a");

		expect(viewers.releaseUnheld(oldTab)).toEqual([]);
		expect(viewers.releaseUnheld(reloaded)).toEqual(["a"]);
	});

	it("releases one named viewer and leaves the rest", () => {
		const viewers = new ViewerConnections();
		const link = client();
		viewers.track(link, "a");
		viewers.track(link, "b");

		expect(viewers.releaseUnheld(link, "a")).toEqual(["a"]);
		expect(viewers.releaseUnheld(link)).toEqual(["b"]);
	});
});
