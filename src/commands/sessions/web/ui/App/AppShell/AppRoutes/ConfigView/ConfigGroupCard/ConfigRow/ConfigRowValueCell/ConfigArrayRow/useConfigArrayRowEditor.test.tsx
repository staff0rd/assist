// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { describeConfigNode } from "../../../../../../../../../../../../shared/describeConfigNode";
import { assistConfigSchema } from "../../../../../../../../../../../../shared/types";
import { configEntryNode } from "../../../../../../../../../../../config/configEntryNode";
import type { ConfigEntryLayers } from "../../../../../../../../../../../config/configEntryLayers";
import type { ConfigEntry } from "../../../../../../../../../../../config/readConfigEntries";
import { useConfigArrayRowEditor } from "./useConfigArrayRowEditor";

const schema = describeConfigNode(assistConfigSchema);

afterEach(() => {
	vi.unstubAllGlobals();
});

function stubWrites() {
	const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => ({
		ok: true,
		status: 200,
		json: async () => ({ target: "repo", removed: true }),
	}));
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

type Posted = { url: string; body: Record<string, unknown> };

function posted(fetchMock: ReturnType<typeof stubWrites>): Posted[] {
	return fetchMock.mock.calls.map(([url, init]) => ({
		url: String(url),
		body: JSON.parse(String(init?.body)),
	}));
}

function entryFor(key: string, layers: ConfigEntryLayers): ConfigEntry {
	const sources = (["project", "repo", "global"] as const).filter(
		(scope) => layers[scope] !== undefined,
	);
	return {
		key,
		type: "array",
		value: undefined,
		source: sources[0] ?? "default",
		sources: [...sources],
		repoKey: "assist",
		layers,
		node: configEntryNode(schema, key),
	};
}

function renderEditor(entry: ConfigEntry) {
	const onSaved = vi.fn();
	const onError = vi.fn();
	const { result } = renderHook(() =>
		useConfigArrayRowEditor({ entry, cwd: "/repo", onSaved, onError }),
	);
	return { result, onSaved, onError };
}

describe("useConfigArrayRowEditor", () => {
	it("adds a repo-scoped run command without copying the project's commands", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [
					{ name: "build", command: "npm run build" },
					{ name: "test", command: "vitest" },
				],
			}),
		);

		act(() => result.current.add());
		act(() => result.current.setScope("repo"));
		act(() => result.current.setValue({ name: "deploy", command: "./deploy" }));
		await act(() => result.current.save());

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "run",
					value: [{ name: "deploy", command: "./deploy" }],
					cwd: "/repo",
					scope: "repo",
				},
			},
		]);
	});

	it("adds a repo-scoped deny rule without copying the project's rules", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("deny", {
				project: [{ pattern: "rm -rf", message: "no" }],
			}),
		);

		act(() => result.current.add());
		act(() => result.current.setScope("repo"));
		act(() => result.current.setValue({ pattern: "curl", message: "ask" }));
		await act(() => result.current.save());

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "deny",
					value: [{ pattern: "curl", message: "ask" }],
					cwd: "/repo",
					scope: "repo",
				},
			},
		]);
	});

	it("adds a repo-scoped subtask without copying the project's subtasks", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("subtasks", { project: [{ title: "write tests" }] }),
		);

		act(() => result.current.add());
		act(() => result.current.setScope("repo"));
		act(() => result.current.setValue({ title: "update docs" }));
		await act(() => result.current.save());

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "subtasks",
					value: [{ title: "update docs" }],
					cwd: "/repo",
					scope: "repo",
				},
			},
		]);
	});

	it("appends to the target scope's own entries rather than the merged list", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build", command: "npm run build" }],
				repo: [{ name: "test", command: "vitest" }],
				global: [{ name: "lint", command: "oxlint" }],
			}),
		);

		act(() => result.current.add());
		act(() => result.current.setScope("repo"));
		act(() => result.current.setValue({ name: "deploy", command: "./deploy" }));
		await act(() => result.current.save());

		expect(posted(fetchMock)[0]?.body.value).toEqual([
			{ name: "test", command: "vitest" },
			{ name: "deploy", command: "./deploy" },
		]);
	});

	it("edits an item in place in its own layer", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [
					{ name: "build", command: "npm run build" },
					{ name: "test", command: "vitest" },
				],
				global: [{ name: "lint", command: "oxlint" }],
			}),
		);

		act(() => result.current.toggle(2));
		act(() => result.current.setValue({ name: "test", command: "vitest run" }));
		await act(() => result.current.save());

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "run",
					value: [
						{ name: "build", command: "npm run build" },
						{ name: "test", command: "vitest run" },
					],
					cwd: "/repo",
					scope: "project",
				},
			},
		]);
	});

	it("preselects the scope that owns the item being edited", () => {
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build" }],
				global: [{ name: "lint" }],
			}),
		);

		act(() => result.current.toggle(0));
		expect(result.current.scopeOf(0)).toBe("global");

		act(() => result.current.toggle(1));
		expect(result.current.scopeOf(1)).toBe("project");
	});

	it("appends to another scope when the item's scope is changed", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build", command: "npm run build" }],
				global: [{ name: "lint", command: "oxlint" }],
			}),
		);

		act(() => result.current.toggle(1));
		act(() => result.current.setScope("global"));
		await act(() => result.current.save());

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "run",
					value: [
						{ name: "lint", command: "oxlint" },
						{ name: "build", command: "npm run build" },
					],
					cwd: "/repo",
					scope: "global",
				},
			},
		]);
	});

	it("removes an item from the layer that owns it", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build" }, { name: "test" }],
				global: [{ name: "lint" }],
			}),
		);

		await act(() => result.current.remove(1));

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "run",
					value: [{ name: "test" }],
					cwd: "/repo",
					scope: "project",
				},
			},
		]);
	});

	it("clears the key at a scope when its last item is removed", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build" }],
				global: [{ name: "lint" }],
			}),
		);

		await act(() => result.current.remove(1));

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/unset",
				body: { key: "run", cwd: "/repo", scope: "project" },
			},
		]);
	});

	it("reorders within the owning layer only", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build" }, { name: "test" }],
				global: [{ name: "lint" }],
			}),
		);

		await act(() => result.current.move(2, -1));

		expect(posted(fetchMock)).toEqual([
			{
				url: "/api/config/set",
				body: {
					key: "run",
					value: [{ name: "test" }, { name: "build" }],
					cwd: "/repo",
					scope: "project",
				},
			},
		]);
	});

	it("refuses to move an item past the edge of its own layer", async () => {
		const fetchMock = stubWrites();
		const { result } = renderEditor(
			entryFor("run", {
				project: [{ name: "build" }],
				global: [{ name: "lint" }],
			}),
		);

		expect(result.current.canMove(0, 1)).toBe(false);
		expect(result.current.canMove(1, -1)).toBe(false);

		await act(() => result.current.move(1, -1));

		expect(fetchMock.mock.calls).toHaveLength(0);
	});

	it("keeps a rejected edit open", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => ({
				ok: false,
				status: 400,
				json: async () => ({ error: "run: command is required" }),
			})),
		);
		const { result, onError } = renderEditor(
			entryFor("run", { project: [{ name: "build" }] }),
		);

		act(() => result.current.toggle(0));
		await act(() => result.current.save());

		expect(onError).toHaveBeenCalledWith("run: command is required");
		expect(result.current.isOpen(0)).toBe(true);
	});
});
