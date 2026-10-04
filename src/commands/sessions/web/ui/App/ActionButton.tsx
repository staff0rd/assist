import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import type { MouseEvent, ReactNode } from "react";
import { actionButtonAttributes } from "./ActionButton/actionButtonAttributes";
import {
	type ActionButtonTone,
	actionButtonSx,
} from "./ActionButton/actionButtonSx";
import { ShortcutTooltip } from "./ActionButton/ShortcutTooltip";
import type { ShortcutName } from "./shortcutRegistry";
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
	tone = "muted",
	size = "small",
	...rest
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
	shortcut?: ShortcutName;
}) {
	const labelled = useLabelledActionsContext();
	const shared = actionButtonAttributes({ label, ...rest });

	return (
		<ShortcutTooltip label={rest.title ?? label} shortcut={rest.shortcut}>
			{labelled ? (
				<Button
					{...shared}
					size="small"
					startIcon={icon}
					sx={{ ...labelledSx, ...actionButtonSx(tone, true) }}
				>
					{label}
				</Button>
			) : (
				<IconButton {...shared} size={size} sx={actionButtonSx(tone, false)}>
					{icon}
				</IconButton>
			)}
		</ShortcutTooltip>
	);
}
