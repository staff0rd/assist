import { describe, expect, it, vi } from "vitest";
import { statusPlugin } from "./statusPlugin";

function directive(name: string, label: string) {
	return { name, children: [{ value: label }] };
}

function render(label: string): string {
	const replaceNode = vi.fn();
	statusPlugin.textDirective(directive("status", label), { replaceNode });
	return replaceNode.mock.calls[0][1].value;
}

describe("statusPlugin", () => {
	it("renders a glyph status with its dashboard glyph", () => {
		expect(render("waiting")).toBe(
			'<span class="assist-status assist-status-waiting" title="waiting"><span class="assist-status-icon" aria-hidden="true">◆</span><span class="sr-only">waiting</span></span>',
		);
	});

	it("renders question with its glyph", () => {
		expect(render("question")).toContain(">?</span>");
	});

	it("renders check as a wrench head", () => {
		const html = render("check");
		expect(html).toContain("<svg");
		expect(html).toContain("rotate(45)");
		expect(html).not.toContain("▲");
	});

	it("names a dot status in hidden text", () => {
		expect(render("running")).toContain('<span class="sr-only">running</span>');
	});

	it("renders running as a dot without a ring", () => {
		const html = render("running");
		expect(html).toContain("<svg");
		expect(html).not.toContain("assist-status-ring");
	});

	it("renders verifying as a ringed dot", () => {
		expect(render("verifying")).toContain("assist-status-ring");
	});

	it("leaves other directives alone", () => {
		const replaceNode = vi.fn();
		statusPlugin.textDirective(directive("kbd", "x"), { replaceNode });
		expect(replaceNode).not.toHaveBeenCalled();
	});

	it("fails on an unknown status", () => {
		expect(() => render("idle")).toThrow(/Unknown :status\[idle\]/);
	});
});
