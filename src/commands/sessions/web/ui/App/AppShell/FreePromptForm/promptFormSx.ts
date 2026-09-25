import type { SxProps, Theme } from "@mui/material";
import { dropdownStyle } from "../DropdownWrapper";

export function promptFormSx(anchored: boolean): SxProps<Theme> {
	if (anchored) return { width: 320 };
	return { ...dropdownStyle, left: "auto", width: 320 };
}
