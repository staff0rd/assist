import { MenuItem } from "@mui/material";
import { type MouseEvent, useRef } from "react";
import { useShiftSkipConfirm } from "../../../../sessions/web/ui/useShiftSkipConfirm";
import { type ClosingStatus, closingLabels } from "./closingLabels";

export function CloseStatusMenuItem({
	status,
	onSelect,
	stop,
}: {
	status: ClosingStatus;
	onSelect: (status: ClosingStatus, skipConfirm: boolean) => void;
	stop: (event: MouseEvent) => void;
}) {
	const ignoreMenuItemEnterClick = useRef(false);
	const { triggerHandlers, withHint } = useShiftSkipConfirm(
		() => onSelect(status, true),
		{ onOpen: () => onSelect(status, false) },
	);
	return (
		<MenuItem
			title={withHint(closingLabels[status].action)}
			onKeyDown={(event) => {
				triggerHandlers.onKeyDown(event);
				if (event.defaultPrevented) ignoreMenuItemEnterClick.current = true;
			}}
			onClick={(event) => {
				if (ignoreMenuItemEnterClick.current) {
					ignoreMenuItemEnterClick.current = false;
					stop(event);
					return;
				}
				triggerHandlers.onClick(event);
			}}
		>
			{closingLabels[status].action}
		</MenuItem>
	);
}
