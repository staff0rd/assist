import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import type { ReactNode } from "react";
import { phoneRowChevronSx } from "../phoneRowSx";
import { phoneItemSx as sx } from "./phoneItemSx";

type PhoneItemKeyValue = { key?: string; value: string };

type Props = {
	dot: string;
	ring?: boolean;
	title: string;
	meta: ReactNode;
	line: string;
	kv?: PhoneItemKeyValue;
	wash?: boolean;
	onTap: () => void;
	actions?: ReactNode[];
};

export function PhoneItemRow({
	dot,
	ring = false,
	title,
	meta,
	line,
	kv,
	wash = false,
	onTap,
	actions = [],
}: Props) {
	return (
		<Box sx={sx.row(wash)} data-testid="phone-autopilot-row">
			<ButtonBase sx={sx.main} onClick={onTap}>
				<Box component="span" aria-hidden sx={sx.dot(dot, ring)} />
				<Box component="span" sx={sx.title}>
					{title}
				</Box>
				<ChevronRightIcon fontSize="small" sx={phoneRowChevronSx} />
				<Box component="span" sx={sx.meta}>
					{meta}
				</Box>
				<Box component="span" sx={sx.line}>
					{line}
				</Box>
				{kv && (
					<Box component="span" sx={sx.kv}>
						{kv.key && (
							<Box component="span" sx={sx.key}>
								{kv.key}
							</Box>
						)}
						<span>{kv.value}</span>
					</Box>
				)}
			</ButtonBase>
			{actions.length > 0 && (
				<Box sx={sx.actions(actions.length)}>{actions}</Box>
			)}
		</Box>
	);
}
