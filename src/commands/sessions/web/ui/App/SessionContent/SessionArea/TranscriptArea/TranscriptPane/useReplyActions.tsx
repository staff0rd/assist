import { type ReactNode, useState } from "react";
import type { groupToolRuns } from "./groupToolRuns";
import { isLongReply } from "./isLongReply";
import { TooVerboseButton } from "./TooVerboseButton";

export type OnTooVerbose = (text: string, isLast: boolean) => void;

type Item = ReturnType<typeof groupToolRuns>[number];

export function useReplyActions(
	items: Item[],
	onTooVerbose?: OnTooVerbose,
): (item: Extract<Item, { kind: "message" }>) => ReactNode {
	const [sentKeys, setSentKeys] = useState<ReadonlySet<string>>(new Set());
	const last = items.at(-1);
	return ({ message }) => {
		if (!onTooVerbose || message.role !== "assistant") return undefined;
		if (sentKeys.has(message.key) || !isLongReply(message.text))
			return undefined;
		const isLast = last?.kind === "message" && last.message.key === message.key;
		return (
			<TooVerboseButton
				onClick={() => {
					setSentKeys((keys) => new Set(keys).add(message.key));
					onTooVerbose(message.text, isLast);
				}}
			/>
		);
	};
}
