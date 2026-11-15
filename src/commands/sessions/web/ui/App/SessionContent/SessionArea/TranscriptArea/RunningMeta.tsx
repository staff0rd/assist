import { formatToolElapsed } from "./formatToolElapsed";
import { useTickingSeconds } from "./useTickingSeconds";

export function RunningMeta({ startedAt }: { startedAt: number }) {
	const seconds = useTickingSeconds(
		Math.floor((Date.now() - startedAt) / 1000),
	);
	return <span>Running · {formatToolElapsed(seconds ?? 0)}</span>;
}
