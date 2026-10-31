import { createLinkWaiters } from "./createLinkWaiters";
import { relayError } from "./relayError";

type Link<S> = { ws: S; version: string };

export type LinkStateOptions = {
	recentLinkMs?: number;
	reconnectWaitMs?: number;
	now?: () => number;
};

const noExtension = () =>
	relayError("no assist extension is connected to this web server", 503);

export function createLinkState<S>({
	recentLinkMs = 90_000,
	reconnectWaitMs = 35_000,
	now = Date.now,
}: LinkStateOptions) {
	let link: Link<S> | undefined;
	let lastSeen = now();
	const waiters = createLinkWaiters<Link<S>>();

	return {
		open(ws: S, version: string): void {
			link = { ws, version };
			lastSeen = now();
			waiters.notify(link);
		},
		close(ws: S): void {
			if (link?.ws !== ws) return;
			link = undefined;
			lastSeen = now();
		},
		version(): string | undefined {
			return link?.version;
		},
		connected(): Promise<Link<S>> {
			if (link) return Promise.resolve(link);
			if (now() - lastSeen > recentLinkMs) return Promise.reject(noExtension());
			return waiters.wait(reconnectWaitMs, noExtension);
		},
	};
}
