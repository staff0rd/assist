import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useLocation, useNavigate } from "react-router";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";
import { activePhoneTab } from "./PhoneTabBar/activePhoneTab";
import { phoneTabBarSx as sx } from "./PhoneTabBar/phoneTabBarSx";
import { phoneTabs } from "./PhoneTabBar/phoneTabs";
import type { PhoneTabRestore } from "./PhoneTabBar/usePhoneTabMemory";

export function PhoneTabBar({
	sessions,
	restore,
}: {
	sessions: SessionInfo[];
	restore: PhoneTabRestore;
}) {
	const { pathname, search } = useLocation();
	const navigate = useNavigate();
	const active = activePhoneTab(pathname);
	if (!active) return null;
	const { questions, needsYou: waiting } = groupSessionsByStatus(sessions);
	const needsYou = questions.length + waiting.length;

	return (
		<Box component="nav" sx={sx.bar} data-testid="phone-tab-bar">
			{phoneTabs.map(({ label, path, Icon }) => (
				<ButtonBase
					key={path}
					sx={sx.tab}
					aria-current={path === active.path ? "page" : undefined}
					onClick={() =>
						path === active.path
							? navigate({ pathname: path, search }, { replace: true })
							: restore(path).forEach((entry) =>
									navigate(entry, { state: { phoneTab: true } }),
								)
					}
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
