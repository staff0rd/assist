import { Box, Checkbox, Radio, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { questionOptionRowSx } from "./questionOptionRowSx";

export function QuestionOptionRow({
	name,
	multiSelect,
	checked,
	label,
	description,
	onChange,
	onPeek,
	children,
}: {
	name: string;
	multiSelect: boolean;
	checked: boolean;
	label: string;
	description?: string;
	onChange: () => void;
	onPeek?: () => void;
	children?: ReactNode;
}) {
	const Control = multiSelect ? Checkbox : Radio;
	return (
		<Box
			component="label"
			sx={questionOptionRowSx(checked)}
			onMouseEnter={onPeek}
			onFocus={onPeek}
		>
			<Control
				name={name}
				size="small"
				checked={checked}
				onChange={onChange}
				sx={{ p: 0, mt: 0.25 }}
			/>
			<Box
				sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}
			>
				<Typography variant="body2" sx={{ fontWeight: 600 }}>
					{label}
				</Typography>
				{description && (
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						{description}
					</Typography>
				)}
				{children}
			</Box>
		</Box>
	);
}
