import { type TailscaleStatus, tailscaleCli } from "./tailscaleStatus";

export async function runningStatus(
	status: () => Promise<TailscaleStatus>,
): Promise<TailscaleStatus | string> {
	let current: TailscaleStatus;
	try {
		current = await status();
	} catch (error) {
		if ((error as { code?: string }).code === "ENOENT")
			return `skipped, ${tailscaleCli()} is not installed`;
		throw error;
	}
	return current.BackendState === "Running"
		? current
		: `skipped, Tailscale is ${current.BackendState ?? "not running"}`;
}
