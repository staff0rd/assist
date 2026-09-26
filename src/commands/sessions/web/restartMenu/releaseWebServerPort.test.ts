import { describe, expect, it, vi } from "vitest";
import {
	onReleaseWebServerPort,
	releaseWebServerPort,
} from "./releaseWebServerPort";

describe("releaseWebServerPort", () => {
	it("is a no-op before a web server registers", () => {
		expect(() => releaseWebServerPort()).not.toThrow();
	});

	it("runs the registered release once", () => {
		const release = vi.fn();
		onReleaseWebServerPort(release);

		releaseWebServerPort();
		releaseWebServerPort();

		expect(release).toHaveBeenCalledOnce();
	});
});
