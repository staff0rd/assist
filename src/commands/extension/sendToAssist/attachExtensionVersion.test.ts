// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachExtensionVersion } from "./attachExtensionVersion";

function versionText(): string | null {
	return document.querySelector("[data-version]")?.textContent ?? null;
}

beforeEach(() => {
	document.body.innerHTML = `<p data-version></p>`;
});

afterEach(() => vi.unstubAllGlobals());

describe("attachExtensionVersion", () => {
	it("shows the manifest version", () => {
		vi.stubGlobal("browser", {
			runtime: { getManifest: () => ({ version: "0.997.0" }) },
		});
		attachExtensionVersion();
		expect(versionText()).toBe("assist 0.997.0");
	});

	it("shows unknown without a browser runtime", () => {
		vi.stubGlobal("browser", undefined);
		attachExtensionVersion();
		expect(versionText()).toBe("assist unknown");
	});

	it("shows unknown when getManifest throws", () => {
		vi.stubGlobal("browser", {
			runtime: {
				getManifest: () => {
					throw new Error("no manifest");
				},
			},
		});
		attachExtensionVersion();
		expect(versionText()).toBe("assist unknown");
	});

	it("does nothing when the page has no version element", () => {
		document.body.innerHTML = "";
		expect(() => attachExtensionVersion()).not.toThrow();
	});
});
