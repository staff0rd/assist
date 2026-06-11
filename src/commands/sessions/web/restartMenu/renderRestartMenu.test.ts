import { describe, expect, it } from "vitest";
import { menuItems } from "./menuItems";
import { renderRestartMenu } from "./renderRestartMenu";

const ansiPattern = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
const stripAnsi = (s: string) => s.replace(ansiPattern, "");

describe("renderRestartMenu", () => {
	it("lists all three commands with number prefixes", () => {
		const out = stripAnsi(renderRestartMenu(menuItems, 0));
		expect(out).toContain("1. Restart daemon");
		expect(out).toContain("2. Restart webserver");
		expect(out).toContain("3. Restart both");
	});

	it("points at the selected item", () => {
		const lines = stripAnsi(renderRestartMenu(menuItems, 0)).split("\n");
		const daemonLine = lines.find((l) => l.includes("Restart daemon"));
		expect(daemonLine?.startsWith("❯")).toBe(true);
	});

	it("includes a footer hint", () => {
		const out = stripAnsi(renderRestartMenu(menuItems, 0));
		expect(out).toContain("enter select");
		expect(out).toContain("esc close");
	});
});
