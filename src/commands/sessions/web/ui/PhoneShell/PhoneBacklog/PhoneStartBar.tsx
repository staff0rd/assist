import Box from "@mui/material/Box";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { PhoneRunOn } from "../PhoneNewSession/PhoneRunOn";
import { PhoneBottomBar } from "./PhoneBottomBar";
import { PhoneHarnessPicker } from "./PhoneHarnessPicker";
import { startLabel } from "./startLabel";
import type { PhoneStart } from "./usePhoneStart";

const noteSx = {
	px: 2.5,
	pt: 1,
	fontSize: 13,
	color: "text.secondary",
	textAlign: "center",
} as const;

export function PhoneStartBar({
	item,
	start,
}: {
	item: BacklogItem;
	start: PhoneStart;
}) {
	const navigate = useNavigate();
	const { inFlight, cwd, launched } = start;
	if (inFlight)
		return (
			<PhoneBottomBar
				button={{
					children: "Open session",
					onClick: () => navigate(`/session/${inFlight.id}`),
				}}
			/>
		);

	return (
		<PhoneBottomBar
			button={{
				children: launched ? "Starting…" : startLabel(item),
				disabled: !cwd || launched,
				onClick: start.start,
			}}
		>
			<PhoneRunOn form={start} />
			<PhoneHarnessPicker
				harnesses={start.harnesses}
				value={start.harness}
				onChange={start.setHarness}
			/>
			{!cwd && <Box sx={noteSx}>Not cloned on {start.node}</Box>}
		</PhoneBottomBar>
	);
}
