import type { ChipProps } from "@mui/material";

export const typeChipColors: Record<string, ChipProps["color"]> = {
	story: "info",
	bug: "error",
};

export const statusChipColors: Record<string, ChipProps["color"]> = {
	todo: "default",
	"in-progress": "warning",
	done: "success",
	wontdo: "error",
};
