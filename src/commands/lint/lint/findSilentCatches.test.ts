import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";
import { findSilentCatches } from "./findSilentCatches";

function lines(source: string): number[] {
	const project = new Project({ useInMemoryFileSystem: true });
	return findSilentCatches(project.createSourceFile("a.ts", source)).map(
		(v) => v.line,
	);
}

describe("findSilentCatches", () => {
	it("flags catch clauses that drop an awaited error", () => {
		expect(
			lines(`async function a() {
	try {
		await apiFetch("/x");
	} catch {
		return null;
	}
}`),
		).toEqual([4]);
	});

	it("flags .catch callbacks that drop the error", () => {
		expect(lines(`apiFetch("/x").catch(() => null);`)).toEqual([1]);
	});

	it("accepts handlers that report or use the error", () => {
		expect(
			lines(`async function a() {
	try {
		await apiFetch("/x");
	} catch (error) {
		reportCaughtError(error, "x");
	}
	try {
		await apiFetch("/y");
	} catch (error) {
		setError(String(error));
	}
	apiFetch("/z").catch((error) => reportCaughtError(error, "z"));
}`),
		).toEqual([]);
	});

	it("ignores synchronous try blocks, response body reads and capture opt-outs", () => {
		expect(
			lines(`async function a(res) {
	try {
		JSON.parse(raw);
	} catch {}
	try {
		return await res.json();
	} catch {}
	try {
		await apiFetch("/health", { capture: false });
	} catch {}
	const body = await res.json().catch(() => ({}));
}`),
		).toEqual([]);
	});
});
