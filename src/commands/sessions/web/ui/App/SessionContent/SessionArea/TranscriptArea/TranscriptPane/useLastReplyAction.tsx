import { type ReactNode, useState } from "react";
import type { groupToolRuns } from "./groupToolRuns";
import { TooVerboseButton } from "./TooVerboseButton";

export function useLastReplyAction(
	items: ReturnType<typeof groupToolRuns>,
	onTooVerbose?: () => void,
): (key: string) => ReactNode {
	const [sentKey, setSentKey] = useState<string | null>(null);
	const last = items.at(-1);
	const lastKey =
		last?.kind === "message" && last.message.role === "assistant"
			? last.message.key
			: null;
	return (key) => {
		if (!onTooVerbose || key !== lastKey || key === sentKey) return undefined;
		return (
			<TooVerboseButton
				onClick={() => {
					setSentKey(key);
					onTooVerbose();
				}}
			/>
		);
	};
}
