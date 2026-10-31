import type { PinConfirmResult } from "../../../notify/PinConfirmResult";
import { type SessionClient, sendTo } from "../broadcast";

const ORIGIN_TTL_MS = 30 * 60 * 1000;

type Waiter<T> = {
	settle: (value: T) => void;
	timer: ReturnType<typeof setTimeout>;
};

export class PinRelay {
	private readonly origins = new Map<string, { node: string; at: number }>();
	private readonly deliveries = new Map<string, Waiter<boolean>>();
	private readonly confirms = new Map<string, Waiter<PinConfirmResult>>();

	constructor(private readonly now: () => number = Date.now) {}

	rememberOrigin(area: string, pin: string, node: string): void {
		this.origins.set(`${area}:${pin}`, { node, at: this.now() });
	}

	takeOrigin(area: string, pin: string): string | undefined {
		const key = `${area}:${pin}`;
		const origin = this.origins.get(key);
		this.origins.delete(key);
		if (!origin || this.now() - origin.at > ORIGIN_TTL_MS) return undefined;
		return origin.node;
	}

	awaitDelivery(
		requestId: string,
		timeoutMs: number,
		settle: (delivered: boolean) => void,
	): void {
		addWaiter(this.deliveries, requestId, timeoutMs, false, settle);
	}

	settleDelivery(requestId: unknown, delivered: boolean): void {
		settleWaiter(this.deliveries, requestId, delivered);
	}

	awaitConfirm(
		requestId: string,
		client: SessionClient,
		timeoutMs: number,
		node: string,
	): void {
		addWaiter(
			this.confirms,
			requestId,
			timeoutMs,
			{ ok: false, message: `${node} did not answer the confirmation.` },
			(result) =>
				sendTo(client, {
					type: "confirm-pin-result",
					requestId,
					found: true,
					...result,
				}),
		);
	}

	settleConfirm(requestId: unknown, result: PinConfirmResult): void {
		settleWaiter(this.confirms, requestId, result);
	}
}

function addWaiter<T>(
	waiters: Map<string, Waiter<T>>,
	requestId: string,
	timeoutMs: number,
	onTimeout: T,
	settle: (value: T) => void,
): void {
	const timer = setTimeout(
		() => settleWaiter(waiters, requestId, onTimeout),
		timeoutMs,
	);
	timer.unref?.();
	waiters.set(requestId, { settle, timer });
}

function settleWaiter<T>(
	waiters: Map<string, Waiter<T>>,
	requestId: unknown,
	value: T,
): void {
	if (typeof requestId !== "string") return;
	const waiter = waiters.get(requestId);
	if (!waiter) return;
	waiters.delete(requestId);
	clearTimeout(waiter.timer);
	waiter.settle(value);
}
