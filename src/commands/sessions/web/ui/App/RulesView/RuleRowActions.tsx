import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { RuleRowMode } from "./RuleRowForm";

type Props = {
	className: string;
	label: string;
	pending: boolean;
	onOpen: (mode: RuleRowMode) => void;
};

export function RuleRowActions({ className, label, pending, onOpen }: Props) {
	return (
		<Box
			className={className}
			sx={{ display: "flex", gap: 0.5, transition: "opacity .2s ease" }}
		>
			<Button
				size="small"
				color="inherit"
				aria-label={`Comment on ${label}`}
				onClick={() => onOpen("comment")}
			>
				Comment
			</Button>
			<Button
				size="small"
				color="inherit"
				disabled={pending}
				aria-label={`Move ${label}`}
				onClick={() => onOpen("move")}
			>
				Move
			</Button>
			<Button
				size="small"
				color="error"
				disabled={pending}
				aria-label={`Delete ${label}`}
				onClick={() => onOpen("delete")}
			>
				Delete
			</Button>
		</Box>
	);
}
