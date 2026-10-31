import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useLocation, useNavigate } from "react-router";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";
import { activePhoneTab } from "./PhoneTabBar/activePhoneTab";
import { phoneTabBarSx as sx } from "./PhoneTabBar/phoneTabBarSx";
import { phoneTabs } from "./PhoneTabBar/phoneTabs";

export function PhoneTabBar({ sessions }: { sessions: SessionInfo[] }) {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const active = activePhoneTab(pathname);
	if (!active) return null;
	const needsYou = groupSessionsByStatus(sessions).needsYou.length;

	return (
		<Box component="nav" sx={sx.bar} data-testid="phone-tab-bar">
			{phoneTabs.map(({ label, path, Icon }) => (
				<ButtonBase
					key={path}
					sx={sx.tab}
					aria-current={path === active.path ? "page" : undefined}
					onClick={() => navigate(path)}
				>
					<Box sx={sx.iconWrap}>
						<Icon />
						{path === "/" && needsYou > 0 && (
							<Box sx={sx.badge} data-testid="phone-tab-badge">
								{needsYou}
							</Box>
						)}
					</Box>
					{label}
				</ButtonBase>
			))}
		</Box>
	);
}
