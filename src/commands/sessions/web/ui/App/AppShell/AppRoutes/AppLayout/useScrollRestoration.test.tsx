// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageShell } from "../PageShell";
import { useScrollRestoration } from "./useScrollRestoration";
import { ScrollRestorationContext } from "../../../../useScrollRestorationContext";

afterEach(cleanup);

function Harness({
	pathname,
	loading,
}: {
	pathname: string;
	loading: boolean;
}) {
	const { containerRef, restoration } = useScrollRestoration(pathname);

	return (
		<ScrollRestorationContext.Provider value={restoration}>
			<div data-testid="scroller" ref={containerRef}>
				<PageShell loading={loading} title="Config">
					rows
				</PageShell>
			</div>
		</ScrollRestorationContext.Provider>
	);
}

function scrollerWithHeight(limit: { max: number }) {
	const scroller = screen.getByTestId("scroller");
	let top = 0;
	Object.defineProperty(scroller, "scrollTop", {
		configurable: true,
		get: () => top,
		set: (value: number) => {
			top = Math.max(0, Math.min(value, limit.max));
		},
	});
	return scroller;
}

function scrollTo(scroller: HTMLElement, offset: number) {
	scroller.scrollTop = offset;
	fireEvent.scroll(scroller);
}

describe("useScrollRestoration", () => {
	it("restores the offset when returning to a route", () => {
		const { rerender } = render(<Harness pathname="/config" loading={false} />);
		const scroller = scrollerWithHeight({ max: 1000 });
		scrollTo(scroller, 300);

		rerender(<Harness pathname="/usage" loading={false} />);
		rerender(<Harness pathname="/config" loading={false} />);

		expect(scroller.scrollTop).toBe(300);
	});

	it("starts at the top on a route that has not been visited", () => {
		const { rerender } = render(<Harness pathname="/config" loading={false} />);
		const scroller = scrollerWithHeight({ max: 1000 });
		scrollTo(scroller, 300);

		rerender(<Harness pathname="/usage" loading={false} />);

		expect(scroller.scrollTop).toBe(0);
	});

	it("restores after the content renders rather than while the page is loading", () => {
		const limit = { max: 1000 };
		const { rerender } = render(<Harness pathname="/config" loading={false} />);
		const scroller = scrollerWithHeight(limit);
		scrollTo(scroller, 300);
		rerender(<Harness pathname="/usage" loading={false} />);

		limit.max = 0;
		rerender(<Harness pathname="/config" loading />);
		expect(scroller.scrollTop).toBe(0);

		limit.max = 1000;
		rerender(<Harness pathname="/config" loading={false} />);
		expect(scroller.scrollTop).toBe(300);
	});
});
