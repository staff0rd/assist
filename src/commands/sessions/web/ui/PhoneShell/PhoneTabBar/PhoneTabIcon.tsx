import Box from "@mui/material/Box";
import type { SvgIconComponent } from "@mui/icons-material";
import { phoneTabBarSx as sx } from "./phoneTabBarSx";

export function PhoneTabIcon({
	Icon,
	count,
	dot,
}: {
	Icon: SvgIconComponent;
	count: number;
	dot: boolean;
}) {
	return (
		<Box sx={sx.iconWrap}>
			<Icon />
			{count > 0 && (
				<Box sx={sx.badge} data-testid="phone-tab-badge">
					{count}
				</Box>
			)}
			{dot && <Box sx={sx.dot} data-testid="phone-tab-dot" />}
		</Box>
	);
}
