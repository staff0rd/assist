// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { diffFileDomId } from "../diffFileDomId";
import { useActiveDiffFile } from "./useActiveDiffFile";

type ObserverStub = {
	root: Element | null;
	fire: () => void;
	observed: number;
};

function stubIntersectionObserver(): ObserverStub {
	const stub: ObserverStub = { root: null, fire: () => {}, observed: 0 };
	class FakeObserver {
		constructor(callback: () => void, options: { root?: Element | null }) {
			stub.root = options.root ?? null;
			stub.fire = callback;
		}
		observe() {
			stub.observed += 1;
		}
		disconnect() {}
	}
	vi.stubGlobal("IntersectionObserver", FakeObserver);
	return stub;
}

function setTop(el: HTMLElement, top: number) {
	el.getBoundingClientRect = () => ({ top }) as DOMRect;
}

function buildDiff(tops: Record<string, number>) {
	const container = document.createElement("div");
	container.style.overflowY = "auto";
	setTop(container, 0);
	document.body.append(container);
	for (const [fileKey, top] of Object.entries(tops)) {
		const wrapper = document.createElement("div");
		wrapper.id = diffFileDomId(fileKey);
		setTop(wrapper, top);
		container.append(wrapper);
	}
	return container;
}

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("useActiveDiffFile", () => {
	it("observes every file, rooted on the diff scroll container", () => {
		const stub = stubIntersectionObserver();
		const container = buildDiff({ "src/a.ts": -400, "src/b.ts": 300 });

		renderHook(() => useActiveDiffFile(["src/a.ts", "src/b.ts"]));

		expect(stub.root).toBe(container);
		expect(stub.observed).toBe(2);
	});

	it("reports the last file scrolled past the toolbar", () => {
		const stub = stubIntersectionObserver();
		buildDiff({ "src/a.ts": -400, "src/b.ts": 20, "src/c.ts": 600 });

		const { result } = renderHook(() =>
			useActiveDiffFile(["src/a.ts", "src/b.ts", "src/c.ts"]),
		);
		act(() => stub.fire());

		expect(result.current).toBe("src/b.ts");
	});

	it("keeps the first file active while nothing has scrolled past", () => {
		const stub = stubIntersectionObserver();
		buildDiff({ "src/a.ts": 300, "src/b.ts": 900 });

		const { result } = renderHook(() =>
			useActiveDiffFile(["src/a.ts", "src/b.ts"]),
		);
		act(() => stub.fire());

		expect(result.current).toBe("src/a.ts");
	});

	it("re-evaluates on scroll, without an intersection change", () => {
		stubIntersectionObserver();
		const container = buildDiff({ "src/a.ts": -400, "src/b.ts": 300 });
		const [, b] = [...container.children] as HTMLElement[];

		const { result } = renderHook(() =>
			useActiveDiffFile(["src/a.ts", "src/b.ts"]),
		);
		expect(result.current).toBe("src/a.ts");

		setTop(b, 10);
		act(() => container.dispatchEvent(new Event("scroll")));

		expect(result.current).toBe("src/b.ts");
	});

	it("reports no active file when the diff has no files", () => {
		stubIntersectionObserver();
		buildDiff({});

		const { result } = renderHook(() => useActiveDiffFile([]));

		expect(result.current).toBeUndefined();
	});
});
