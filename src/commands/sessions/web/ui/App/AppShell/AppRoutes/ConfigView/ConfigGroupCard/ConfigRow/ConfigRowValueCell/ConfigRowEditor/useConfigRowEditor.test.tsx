// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConfigEntry } from "../../../../../../../../../../../config/readConfigEntries";
import type { ConfigSource } from "../../../../../../../../../../../config/resolveConfigSources";
import { useConfigRowEditor } from "./useConfigRowEditor";

function runEntry(sources: ConfigSource[], repoKey: string): ConfigEntry {
	return {
		key: "run",
		type: "array",
		value: [{ name: "start", command: "npm" }],
		source: sources[0] ?? "default",
		sources,
		repoKey,
	};
}

function options(entry: ConfigEntry) {
	return { entry, cwd: "/repo", onSaved: vi.fn(), onError: vi.fn() };
}

function renderEditor(entry: ConfigEntry) {
	return renderHook(
		(props: ReturnType<typeof options>) => useConfigRowEditor(props),
		{
			initialProps: options(entry),
		},
	);
}

describe("useConfigRowEditor", () => {
	it("preselects this repo for an array entry set only under repos", () => {
		const { result } = renderEditor(runEntry(["repo"], "planner-assistant"));

		expect(result.current.scope).toBe("repo");
	});

	it("re-derives the scope when the selected repo changes", () => {
		const { result, rerender } = renderEditor(runEntry(["project"], "one"));
		expect(result.current.scope).toBe("project");

		rerender(options(runEntry(["repo"], "two")));

		expect(result.current.scope).toBe("repo");
	});

	it("re-derives the scope when a reload moves the value to another scope", () => {
		const { result, rerender } = renderEditor(
			runEntry(["project", "repo"], "assist"),
		);
		expect(result.current.scope).toBe("project");

		rerender(options(runEntry(["repo"], "assist")));

		expect(result.current.scope).toBe("repo");
	});

	it("keeps a picked scope across reloads that leave provenance unchanged", () => {
		const { result, rerender } = renderEditor(runEntry(["repo"], "assist"));

		act(() => result.current.setScope("global"));
		expect(result.current.scope).toBe("global");

		rerender(options(runEntry(["repo"], "assist")));

		expect(result.current.scope).toBe("global");
	});

	it("drops a picked scope once the entry's provenance moves", () => {
		const { result, rerender } = renderEditor(runEntry(["repo"], "assist"));

		act(() => result.current.setScope("project"));
		rerender(options(runEntry(["global"], "assist")));

		expect(result.current.scope).toBe("global");
	});
});
