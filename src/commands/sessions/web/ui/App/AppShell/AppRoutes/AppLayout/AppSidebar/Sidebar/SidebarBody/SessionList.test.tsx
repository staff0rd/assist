// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SessionList } from "./SessionList";
import { StarredSessionsProvider } from "../../../../useStarredSessions";

afterEach(cleanup);

function renderList() {
	return render(
		<StarredSessionsProvider sessions={[]} setSessionStarred={() => {}}>
			<SessionList
				sessions={[]}
				pendingLaunches={[]}
				activeId={null}
				initialized={new Set()}
				onSelect={() => {}}
				onDismissPending={() => {}}
				onRetry={() => {}}
				onRestart={() => {}}
				onDismiss={() => {}}
				onSetAutoRun={() => {}}
				onSetAutoAdvance={() => {}}
			/>
		</StarredSessionsProvider>,
	);
}

describe("SessionList scroll area", () => {
	it("scrolls without vertical padding so sticky group headers stop at its top edge", () => {
		const { container } = renderList();
		const scrollport = container.firstElementChild as HTMLElement;

		expect(getComputedStyle(scrollport).overflow).toBe("auto");
		expect(getComputedStyle(scrollport).paddingTop).toBe("0");
	});
});
