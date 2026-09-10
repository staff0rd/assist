import type { ChipProps } from "@mui/material";
import { statusChipColors } from "../../../backlog/web/ui/components/typeChipColors";

const settled = new Set(["done", "wontdo"]);

export function usageItemStatusChip(status: string): {
	label: string;
	color: ChipProps["color"];
} {
	if (settled.has(status))
		return { label: status, color: statusChipColors[status] };
	return { label: "running", color: "warning" };
}
