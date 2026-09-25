// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FileTypeIcon } from "./FileTypeIcon";

afterEach(cleanup);

function fills(): string[] {
	return [...document.querySelectorAll("svg [fill]")].map(
		(node) => node.getAttribute("fill") ?? "",
	);
}

function svgAttribute(name: string): string | null {
	return document.querySelector("svg")?.getAttribute(name) ?? null;
}

describe("FileTypeIcon", () => {
	it("uses the brand mark for a known extension", () => {
		render(<FileTypeIcon path="src/useDaemonState.ts" />);

		expect(fills()).toContain("#007acc");
	});

	it("shares one mark across aliased extensions", () => {
		render(<FileTypeIcon path="src/App.tsx" />);

		expect(fills()).toContain("#61dafb");
	});

	it("colours marks that ship without fills", () => {
		render(<FileTypeIcon path="README.md" />);

		expect(svgAttribute("fill")).toBe("#519aba");
	});

	it("matches extensionless names like Dockerfile", () => {
		render(<FileTypeIcon path="build/Dockerfile" />);

		expect(fills()).toContain("#00aada");
	});

	it("falls back to a generic file icon for unknown extensions", () => {
		render(<FileTypeIcon path="src/data.abc" />);

		expect(svgAttribute("data-testid")).toBe("InsertDriveFileOutlinedIcon");
	});
});
