import { linkRefKey } from "../../sessions/web/linkStatus/linkRefKey";
import type { LinkRef } from "../../sessions/web/linkStatus/LinkState";
import { applyLinkState, clearLinkState } from "./applyLinkState";
import { parseItemLink } from "./parseItemLink";
import { requestLinkStatus } from "./requestLinkStatus";

const LINK_SELECTOR = ".markdown-body a[href], .js-issue-title a[href]";
const NATIVE_SELECTOR = ".issue-link, .js-issue-link";

type PendingRef = { ref: LinkRef; anchors: HTMLAnchorElement[] };

function collectPending(): Map<string, PendingRef> {
	const pending = new Map<string, PendingRef>();
	for (const anchor of document.querySelectorAll<HTMLAnchorElement>(
		LINK_SELECTOR,
	)) {
		const processed = anchor.dataset.assistLinkStatus;
		if (processed === anchor.href) continue;
		if (processed !== undefined) clearLinkState(anchor);
		anchor.dataset.assistLinkStatus = anchor.href;
		const ref = anchor.matches(NATIVE_SELECTOR)
			? null
			: parseItemLink(anchor.href);
		if (!ref) continue;
		const key = linkRefKey(ref);
		const entry = pending.get(key) ?? { ref, anchors: [] };
		entry.anchors.push(anchor);
		pending.set(key, entry);
	}
	return pending;
}

export function decorateLinkStatus(): void {
	const pending = collectPending();
	if (pending.size === 0) return;
	void requestLinkStatus([...pending.values()].map(({ ref }) => ref)).then(
		(result) => {
			if (!result.ok) return;
			for (const [key, { anchors }] of pending) {
				const state = result.states[key];
				if (!state) continue;
				for (const anchor of anchors)
					if (anchor.dataset.assistLinkStatus === anchor.href)
						applyLinkState(anchor, state);
			}
		},
	);
}
