import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useLocation, useNavigate } from "react-router";
import type { SessionInfo } from "../types";
import { groupSessionsByStatus } from "./groupSessionsByStatus";
import { usePhoneAutopilotContext } from "./PhoneAutopilot/usePhoneAutopilotContext";
import { activePhoneTab } from "./PhoneTabBar/activePhoneTab";
import { PhoneTabIcon } from "./PhoneTabBar/PhoneTabIcon";
import { phoneTabBarSx as sx } from "./PhoneTabBar/phoneTabBarSx";
import type { PhoneTabRestore } from "./PhoneTabBar/usePhoneTabMemory";
import { visiblePhoneTabs } from "./PhoneTabBar/visiblePhoneTabs";

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
	const autopilot = usePhoneAutopilotContext();
	if (!active) return null;
	const { questions, needsYou: waiting } = groupSessionsByStatus(sessions);
	const needsYou = questions.length + waiting.length;
	const open = (path: string) =>
		path === active.path
			? navigate({ pathname: path, search }, { replace: true })
			: restore(path).forEach((entry) =>
					navigate(entry, { state: { phoneTab: true } }),
				);

	return (
		<Box component="nav" sx={sx.bar} data-testid="phone-tab-bar">
			{visiblePhoneTabs(!!autopilot?.repos.length).map(
				({ label, path, Icon }) => (
					<ButtonBase
						key={path}
						sx={sx.tab}
						aria-current={path === active.path ? "page" : undefined}
						onClick={() => open(path)}
					>
						<PhoneTabIcon
							Icon={Icon}
							count={path === "/" ? needsYou : 0}
							dot={path === "/autopilot" && !!autopilot?.failed}
						/>
						{label}
					</ButtonBase>
				),
			)}
		</Box>
	);
}
