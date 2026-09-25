import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { ReactNode } from "react";

type Props = {
	label: string;
	disabled: boolean;
	icon: ReactNode;
	title?: string;
	onClick?: () => void;
};

export function ConfigActionButton({
	label,
	disabled,
	icon,
	title,
	onClick,
}: Props) {
	if (!onClick) return null;
	const button = (
		<IconButton
			size="small"
			aria-label={label}
			disabled={disabled}
			onClick={onClick}
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
