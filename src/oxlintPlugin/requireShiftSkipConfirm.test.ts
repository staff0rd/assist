import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const fixtures: Record<string, string> = {
	"PlainTrigger.tsx": `import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
export function PlainTrigger() {
	const [confirming, setConfirming] = useState(false);
	return (
		<>
			<button onClick={() => setConfirming(true)}>Delete</button>
			{confirming && <ConfirmDialog onConfirm={() => {}} onCancel={() => setConfirming(false)} />}
		</>
	);
}
`,
	"HookTrigger.tsx": `import { ConfirmDialog } from "./ConfirmDialog";
import { useShiftSkipConfirm } from "./useShiftSkipConfirm";
export function HookTrigger() {
	const { confirming, close, triggerHandlers } = useShiftSkipConfirm(() => {});
	return (
		<>
			<button {...triggerHandlers}>Delete</button>
			{confirming && <ConfirmDialog onConfirm={() => {}} onCancel={close} />}
		</>
	);
}
`,
	"ExemptPrompt.tsx": `import { ConfirmDialog } from "./ConfirmDialog";
export function ExemptPrompt() {
	return <ConfirmDialog onConfirm={() => {}} onCancel={() => {}} />;
}
`,
	"OtherDialog.tsx": `import Dialog from "./Dialog";
export function OtherDialog() {
	return <Dialog open />;
}
`,
};

let codesByFile: Map<string, number>;

const hits = (file: string): number => codesByFile.get(file) ?? 0;

beforeAll(() => {
	const dir = mkdtempSync(join(tmpdir(), "require-shift-skip-confirm-"));
	try {
		for (const [name, content] of Object.entries(fixtures)) {
			writeFileSync(join(dir, name), content);
		}
		const config = join(dir, ".oxlintrc.json");
		writeFileSync(
			config,
			JSON.stringify({
				jsPlugins: [resolve("oxlint-rules/requireShiftSkipConfirm.ts")],
				categories: { correctness: "off" },
				rules: {
					"confirm/require-shift-skip-confirm": [
						"error",
						{ allow: { "ExemptPrompt.tsx": "not click-triggered" } },
					],
				},
			}),
		);
		let stdout: string;
		try {
			stdout = execFileSync(
				resolve("node_modules/.bin/oxlint"),
				["--config", config, "--format", "json", dir],
				{ encoding: "utf8" },
			);
		} catch (error) {
			stdout = (error as { stdout: string }).stdout;
		}
		const parsed = JSON.parse(stdout) as {
			diagnostics: { code: string; filename: string }[];
		};
		codesByFile = new Map();
		for (const diagnostic of parsed.diagnostics) {
			if (diagnostic.code !== "confirm(require-shift-skip-confirm)") continue;
			const file = basename(diagnostic.filename);
			codesByFile.set(file, hits(file) + 1);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}, 30_000);

afterAll(() => {
	codesByFile = new Map();
});

describe("confirm/require-shift-skip-confirm", () => {
	it("fires when ConfirmDialog is rendered without useShiftSkipConfirm", () => {
		expect(hits("PlainTrigger.tsx")).toBe(1);
	});

	it.each(["HookTrigger.tsx", "ExemptPrompt.tsx", "OtherDialog.tsx"])(
		"allows %s",
		(file) => {
			expect(hits(file)).toBe(0);
		},
	);
});
