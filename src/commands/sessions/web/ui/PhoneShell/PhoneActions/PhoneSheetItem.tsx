import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";

const iconSx = {
	width: 22,
	display: "grid",
	placeItems: "center",
	flex: "none",
} as const;

type Props = {
	label: string;
	detail?: string;
	icon?: ReactNode;
	end?: ReactNode;
	danger?: boolean;
	onClick?: () => void;
};

export function PhoneSheetItem({
	label,
	detail,
	icon,
	end,
	danger,
	onClick,
}: Props) {
	const tone = danger ? "error.main" : "primary.main";
	return (
		<ButtonBase
			component={onClick ? "button" : "div"}
			disabled={!onClick}
			sx={[nodeListSx.item, danger ? { color: tone } : {}]}
			onClick={onClick}
		>
			{icon && <Box sx={[iconSx, { color: tone }]}>{icon}</Box>}
			<Box component="span" sx={nodeListSx.grow}>
				{label}
				{detail && (
					<Box component="span" sx={nodeListSx.detail}>
						{detail}
					</Box>
				)}
			</Box>
			{end && <Box sx={nodeListSx.end}>{end}</Box>}
		</ButtonBase>
	);
}
