import type { KeyboardEvent, MouseEvent } from "react";
import { formatItemId } from "../../../../../backlog/formatItemId";
import type { BacklogTarget } from "../../backlogTarget";
import type { ChildDismiss, DismissOptions } from "../../types";
import { isMarkDoneChord } from "./isMarkDoneChord";
import { useMarkItemDone } from "../SessionContent/SessionActionButtons/useMarkItemDone";

export type DismissBacklog = {
	target: BacklogTarget;
	cwd?: string;
	node?: string;
};

type TriggerHandlers = {
	onClick: (e: MouseEvent<HTMLElement>) => void;
	onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
};

export function useDismissMarkDone(
	backlog: DismissBacklog | undefined,
	onDismiss: (opts?: DismissOptions) => void,
	childDismiss: ChildDismiss | undefined,
	handlers: TriggerHandlers,
) {
	const { error, clearError, confirm } = useMarkItemDone(
		backlog?.target.itemId ?? 0,
		backlog?.cwd,
		() => {
			onDismiss({ closeServerRuns: true });
			childDismiss?.onDismissChildren();
		},
		backlog?.node,
	);
	if (!backlog) return { error, clearError, triggerHandlers: handlers };
	return {
		error,
		clearError,
		hint: `Shift+Ctrl also marks ${formatItemId(backlog.target.itemId)} done`,
		triggerHandlers: {
			onClick: (e: MouseEvent<HTMLElement>) => {
				if (!isMarkDoneChord(e)) return handlers.onClick(e);
				e.stopPropagation();
				void confirm();
			},
			onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
				if (e.key !== "Enter" || !isMarkDoneChord(e))
					return handlers.onKeyDown(e);
				e.preventDefault();
				e.stopPropagation();
				void confirm();
			},
		},
	};
}
