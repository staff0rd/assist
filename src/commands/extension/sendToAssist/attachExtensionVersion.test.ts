// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachExtensionVersion } from "./attachExtensionVersion";

const INSTALL = "https://example.test/assist-1.2.4.xpi";

function versionElement(): HTMLElement {
	return document.querySelector("[data-version]") as HTMLElement;
}

function stubBrowser(version: string): void {
	vi.stubGlobal("browser", {
		runtime: { getManifest: () => ({ version }) },
		storage: { local: { get: async () => ({}) } },
	});
}

function stubUpdates(extension: unknown): void {
	vi.stubGlobal(
		"fetch",
		vi.fn(async () => Response.json({ extension })),
	);
}

beforeEach(() => {
	document.body.innerHTML = `<p data-version></p>`;
});

afterEach(() => vi.unstubAllGlobals());

describe("attachExtensionVersion", () => {
	it("shows both versions and an Install link when behind", async () => {
		stubBrowser("1.2.3");
		stubUpdates({ latest: "1.2.4", installLink: INSTALL });
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe(
			"assist v1.2.3 installed · v1.2.4 available Install",
		);
		expect(versionElement().querySelector("a")?.href).toBe(INSTALL);
	});

	it("fetches updates from the configured server", async () => {
		stubBrowser("1.2.3");
		stubUpdates({ latest: "1.2.3" });
		await attachExtensionVersion();
		expect(fetch).toHaveBeenCalledWith(
			"http://localhost:3100/api/updates",
			expect.anything(),
		);
	});

	it("shows up to date when the version matches the latest", async () => {
		stubBrowser("1.2.4");
		stubUpdates({ latest: "1.2.4", installLink: INSTALL });
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe("assist v1.2.4 · up to date");
		expect(versionElement().querySelector("a")).toBeNull();
	});

	it("shows it couldn't check when the server is unreachable", async () => {
		stubBrowser("1.2.3");
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new TypeError("NetworkError");
			}),
		);
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe(
			"assist v1.2.3 · couldn't check for updates (server unreachable)",
		);
	});

	it("shows it couldn't check when no latest version is known", async () => {
		stubBrowser("1.2.3");
		stubUpdates({});
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe(
			"assist v1.2.3 · couldn't check for updates (server unreachable)",
		);
	});

	it("shows unknown without a browser runtime", async () => {
		vi.stubGlobal("browser", undefined);
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe("assist unknown");
	});

	it("shows unknown when getManifest throws", async () => {
		vi.stubGlobal("browser", {
			runtime: {
				getManifest: () => {
					throw new Error("no manifest");
				},
			},
		});
		await attachExtensionVersion();
		expect(versionElement().textContent).toBe("assist unknown");
	});

	it("does nothing when the page has no version element", async () => {
		document.body.innerHTML = "";
		await expect(attachExtensionVersion()).resolves.toBeUndefined();
	});
});
