import { describe, expect, it } from "vitest";
import { formatExtensionUpdate } from "../browser/formatExtensionUpdate";
import { extensionUpdateStatus } from "./extensionUpdateStatus";

const latest = { version: "0.985.0", update_link: "https://x/0.985.0.xpi" };

describe("extensionUpdateStatus", () => {
	it("offers the link when the connected extension is older", () => {
		const status = extensionUpdateStatus("0.984.0", latest);
		expect(status).toEqual({
			connected: "0.984.0",
			latest: "0.985.0",
			updateLink: latest.update_link,
			behind: true,
		});
		expect(formatExtensionUpdate(status)).toBe(
			"latest signed: v0.985.0 (behind; the assist web UI offers the install link)",
		);
	});

	it("is up to date at the latest version", () => {
		const status = extensionUpdateStatus("0.985.0", latest);
		expect(status.behind).toBe(false);
		expect(status.updateLink).toBeUndefined();
		expect(formatExtensionUpdate(status)).toBe(
			"latest signed: v0.985.0 (up to date)",
		);
	});

	it("is not behind when newer than the latest signed build or not connected", () => {
		expect(extensionUpdateStatus("0.986.0", latest).behind).toBe(false);
		expect(extensionUpdateStatus(undefined, latest).behind).toBe(false);
		expect(extensionUpdateStatus("1.0.0-dev", undefined).behind).toBe(false);
	});

	it("says when the latest signed build is unknown", () => {
		expect(
			formatExtensionUpdate(extensionUpdateStatus("0.984.0", undefined)),
		).toBe("latest signed: unknown (updates.json unreachable)");
	});
});
