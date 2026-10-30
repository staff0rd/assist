import { extensionRuntime } from "../sendToAssist/extensionRuntime";
import { BROWSER_KEEPALIVE_TYPE, type RunDecision } from "./types";
import { buildRunApprovalPanel } from "./buildRunApprovalPanel";

const KEEP_EVENT_PAGE_AWAKE_MS = 15_000;

function keepEventPageAwake(): () => void {
	const interval = setInterval(() => {
		extensionRuntime()
			?.sendMessage({ type: BROWSER_KEEPALIVE_TYPE })
			.catch(() => undefined);
	}, KEEP_EVENT_PAGE_AWAKE_MS);
	return () => clearInterval(interval);
}

export function showRunApproval(
	code: string,
	timeoutMs: number,
): Promise<RunDecision> {
	const panel = buildRunApprovalPanel(code);
	document.body.append(panel.host);
	const deadline = Date.now() + timeoutMs;
	const stopKeepingAwake = keepEventPageAwake();
	return new Promise((resolve) => {
		const tick = () => {
			const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
			panel.countdown.textContent = `Declines automatically in ${seconds}s`;
			if (seconds === 0) finish("timeout");
		};
		const timer = setInterval(tick, 1000);
		function finish(decision: RunDecision): void {
			clearInterval(timer);
			stopKeepingAwake();
			panel.host.remove();
			resolve(decision);
		}
		panel.run.addEventListener("click", () => finish("run"));
		panel.dismiss.addEventListener("click", () => finish("declined"));
		tick();
	});
}
