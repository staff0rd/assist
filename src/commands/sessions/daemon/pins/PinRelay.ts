type Waiter = {
	settle: (delivered: boolean) => void;
	timer: ReturnType<typeof setTimeout>;
};

export class PinRelay {
	private readonly deliveries = new Map<string, Waiter>();

	awaitDelivery(
		requestId: string,
		timeoutMs: number,
		settle: (delivered: boolean) => void,
	): void {
		const timer = setTimeout(
			() => this.settleDelivery(requestId, false),
			timeoutMs,
		);
		timer.unref?.();
		this.deliveries.set(requestId, { settle, timer });
	}

	settleDelivery(requestId: unknown, delivered: boolean): void {
		if (typeof requestId !== "string") return;
		const waiter = this.deliveries.get(requestId);
		if (!waiter) return;
		this.deliveries.delete(requestId);
		clearTimeout(waiter.timer);
		waiter.settle(delivered);
	}
}
