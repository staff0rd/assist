export function timeoutSignal(
	callerSignal: AbortSignal | null | undefined,
	timeoutMs: number,
): { signal: AbortSignal; clear: () => void } {
	const controller = new AbortController();
	const abortWithCaller = () => controller.abort(callerSignal?.reason);
	if (callerSignal?.aborted) abortWithCaller();
	else callerSignal?.addEventListener("abort", abortWithCaller, { once: true });
	const timer = setTimeout(
		() =>
			controller.abort(
				new DOMException(
					`timed out after ${timeoutMs / 1000}s`,
					"TimeoutError",
				),
			),
		timeoutMs,
	);
	return {
		signal: controller.signal,
		clear: () => {
			clearTimeout(timer);
			callerSignal?.removeEventListener("abort", abortWithCaller);
		},
	};
}
