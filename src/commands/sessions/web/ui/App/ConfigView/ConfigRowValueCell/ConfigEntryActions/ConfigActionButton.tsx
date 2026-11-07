import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

type Props = {
	label: string;
	disabled: boolean;
	icon: ReactNode;
	title?: string;
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

export function ConfigActionButton({
	label,
	disabled,
	icon,
	title,
	onClick,
	onKeyDown,
}: Props) {
	if (!onClick) return null;
	const button = (
		<IconButton
			size="small"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
			onKeyDown={onKeyDown}
		>
			{icon}
		</IconButton>
	);
	if (!title) return button;
	return (
		<Tooltip title={title}>
			<span>{button}</span>
		</Tooltip>
	);
}
