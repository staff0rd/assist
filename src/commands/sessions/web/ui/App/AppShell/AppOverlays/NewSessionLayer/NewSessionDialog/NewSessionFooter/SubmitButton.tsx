import Button from "@mui/material/Button";
import type { MouseEvent } from "react";

export type FooterProps = {
	submitLabel: string;
	disabled?: boolean;
	loading?: boolean;
	onClick?: (e: MouseEvent) => void;
};

export const FOOTER_HINTS = [
	["Enter", "start"],
	["Shift+Enter", "newline"],
	["Shift+click", "start & open"],
	["Esc", "close"],
] as const;

export function SubmitButton({
	submitLabel,
	disabled = false,
	loading = false,
	onClick,
}: FooterProps) {
	return (
		<Button
			type="submit"
			onClick={onClick}
			variant="contained"
			disabled={disabled}
			loading={loading}
		>
			{submitLabel}
		</Button>
	);
}
