import { Divider, Menu, MenuItem } from "@mui/material";
import type { MouseEvent, ReactNode } from "react";
import { CloseStatusMenuItem } from "./CloseStatusMenuItem";
import type { ClosingStatus } from "./closingLabels";

const statuses: ClosingStatus[] = ["done", "wontdo"];

export function CloseItemMenu({
	anchorEl,
	open,
	onClose,
	onRefine,
	onSelect,
	stop,
	children,
}: {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	onRefine: () => void;
	onSelect: (status: ClosingStatus, skipConfirm: boolean) => void;
	stop: (event: MouseEvent) => void;
	children?: ReactNode[];
}) {
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
			{statuses.map((status) => (
				<CloseStatusMenuItem key={status} status={status} onSelect={onSelect} />
			))}
			{children && children.length > 0 && <Divider />}
			{children}
		</Menu>
	);
}
