import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { touchTarget } from "../../designSystem/touchTarget";

function optionSx(checked: boolean) {
	return {
		display: "grid",
		gridTemplateColumns: "auto 1fr",
		columnGap: 1.25,
		alignItems: "start",
		minHeight: touchTarget,
		px: 1.5,
		py: 1.25,
		borderRadius: "12px",
		border: 1,
		borderColor: checked ? "primary.main" : "divider",
		bgcolor: checked
			? (t: Theme) => t.tokens.color.selected
			: "background.default",
		cursor: "pointer",
	} as const;
}

export function PhoneQuestionOption({
	name,
	multiSelect,
	checked,
	label,
	description,
	onChange,
	children,
}: {
	name: string;
	multiSelect: boolean;
	checked: boolean;
	label: string;
	description?: string;
	onChange: () => void;
	children?: ReactNode;
}) {
	const Control = multiSelect ? Checkbox : Radio;
	return (
		<Box component="label" sx={optionSx(checked)}>
			<Control
				name={name}
				checked={checked}
				onChange={onChange}
				sx={{ p: 0 }}
			/>
			<Box sx={{ minWidth: 0 }}>
				<Box sx={{ fontSize: 16, fontWeight: 600 }}>{label}</Box>
				{description && (
					<Box sx={{ fontSize: 13, lineHeight: 1.35, color: "text.secondary" }}>
						{description}
					</Box>
				)}
				{children}
			</Box>
		</Box>
	);
}
