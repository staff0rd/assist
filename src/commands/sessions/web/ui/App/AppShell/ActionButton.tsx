import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import type { MouseEvent, ReactNode } from "react";
import {
	type ActionButtonTone,
	actionButtonSx,
} from "./ActionButton/actionButtonSx";
import { useLabelledActionsContext } from "./useLabelledActionsContext";

const labelledSx = {
	textTransform: "none",
	flexShrink: 0,
	minWidth: 0,
	px: 1,
	whiteSpace: "nowrap",
} as const;

export function ActionButton({
	label,
	icon,
	onClick,
	title,
	ariaLabel,
	tone = "muted",
	size = "small",
	disabled,
	pressed,
}: {
	label: string;
	icon: ReactNode;
	onClick: (event: MouseEvent<HTMLElement>) => void;
	title?: string;
	ariaLabel?: string;
	tone?: ActionButtonTone;
	size?: "small" | "medium";
	disabled?: boolean;
	pressed?: boolean;
}) {
	const labelled = useLabelledActionsContext();
	const shared = {
		onClick,
		disabled,
		title,
		"aria-label": ariaLabel ?? title ?? label,
		"aria-pressed": pressed,
	};

	if (labelled)
		return (
			<Button
				{...shared}
				size="small"
				startIcon={icon}
				sx={{ ...labelledSx, ...actionButtonSx(tone, true) }}
			>
				{label}
			</Button>
		);

	return (
		<IconButton {...shared} size={size} sx={actionButtonSx(tone, false)}>
			{icon}
		</IconButton>
	);
}
