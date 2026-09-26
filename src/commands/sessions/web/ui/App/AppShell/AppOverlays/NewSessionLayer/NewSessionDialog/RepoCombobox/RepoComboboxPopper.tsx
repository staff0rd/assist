import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

const popperSx = { zIndex: (theme: Theme) => theme.zIndex.modal + 1 };

export function RepoComboboxPopper({
	open,
	anchor,
	children,
}: {
	open: boolean;
	anchor: HTMLElement | null;
	children: ReactNode;
}) {
	return (
		<Popper
			open={open}
			anchorEl={anchor}
			placement="bottom-start"
			sx={popperSx}
		>
			<Paper
				sx={{ maxHeight: 240, overflowY: "auto", width: anchor?.clientWidth }}
				onMouseDown={(e) => e.preventDefault()}
			>
				{children}
			</Paper>
		</Popper>
	);
}
