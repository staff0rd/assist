import { Divider, Menu, MenuItem } from "@mui/material";
import { type MouseEvent, useRef } from "react";
import { shiftSkipsConfirmHandlers } from "../../../../sessions/web/ui/App/SessionContent/SessionActionButtons/shiftSkipsConfirmHandlers";
import { type ClosingStatus, closingLabels } from "./closingLabels";

const statuses: ClosingStatus[] = ["done", "wontdo"];

export function CloseItemMenu({
	anchorEl,
	open,
	onClose,
	onRefine,
	onSelect,
	stop,
}: {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	onRefine: () => void;
	onSelect: (status: ClosingStatus, skipConfirm: boolean) => void;
	stop: (event: MouseEvent) => void;
}) {
	const ignoreMenuItemEnterClick = useRef(false);
	return (
		<Menu anchorEl={anchorEl} open={open} onClose={onClose} onClick={stop}>
			<MenuItem
				onClick={(event) => {
					stop(event);
					onRefine();
				}}
			>
				Refine
			</MenuItem>
			<Divider />
			{statuses.map((status) => {
				const handlers = shiftSkipsConfirmHandlers(
					() => onSelect(status, true),
					() => onSelect(status, false),
				);
				return (
					<MenuItem
						key={status}
						title={`${closingLabels[status].action} (Shift skips confirmation)`}
						onKeyDown={(event) => {
							handlers.onKeyDown(event);
							if (event.defaultPrevented)
								ignoreMenuItemEnterClick.current = true;
						}}
						onClick={(event) => {
							if (ignoreMenuItemEnterClick.current) {
								ignoreMenuItemEnterClick.current = false;
								stop(event);
								return;
							}
							handlers.onClick(event);
						}}
					>
						{closingLabels[status].action}
					</MenuItem>
				);
			})}
		</Menu>
	);
}
