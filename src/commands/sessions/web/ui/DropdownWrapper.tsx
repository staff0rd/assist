import type { SxProps, Theme } from "@mui/material";
import Paper from "@mui/material/Paper";
import { type ReactNode, useRef, useState } from "react";
import { FilterTrigger } from "./FilterTrigger";

export const dropdownStyle: SxProps<Theme> = {
	position: "absolute",
	top: "100%",
	left: 0,
	right: 0,
	mt: 0.25,
	maxHeight: 200,
	overflowY: "auto",
	zIndex: 10,
};

export function DropdownWrapper({
	label,
	children,
	disabled = false,
}: {
	label: ReactNode;
	children: (close: () => void) => ReactNode;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLFieldSetElement>(null);

	return (
		<Paper
			component="fieldset"
			ref={wrapperRef}
			variant="outlined"
			sx={{ position: "relative", border: "none", m: 0, p: 0 }}
			onBlur={(e: React.FocusEvent) => {
				if (!wrapperRef.current?.contains(e.relatedTarget as Node))
					setOpen(false);
			}}
		>
			<FilterTrigger
				label={label}
				open={open}
				disabled={disabled}
				onClick={() => setOpen(!open)}
			/>
			{open && children(() => setOpen(false))}
		</Paper>
	);
}
