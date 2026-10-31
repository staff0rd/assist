import { describe, expect, it } from "vitest";
import { iosRelevantPaths } from "./iosRelevantPaths";

describe("iosRelevantPaths", () => {
	it("covers the fixed iOS paths and PhoneShell's import closure but not desktop-only UI", async () => {
		const paths = await iosRelevantPaths();
		expect(paths).toEqual(
			expect.arrayContaining([
				"ios-app",
				".github/workflows/ios.yml",
				"src/commands/sessions/web/ios/buildIosWeb.ts",
				"src/commands/sessions/web/getHtml.ts",
				"src/commands/sessions/web/ui/App.tsx",
				"src/commands/sessions/web/ui/PhoneShell.tsx",
				"src/commands/sessions/web/ui/PhoneShell/PhoneTabBar.tsx",
			]),
		);
		expect(paths).not.toContain(
			"src/commands/sessions/web/ui/App/AppShell/AppRoutes/BackupsView.tsx",
		);
		expect(paths.some((p) => p.startsWith("node_modules/"))).toBe(false);
	}, 30_000);
});
