import Box from "@mui/material/Box";
import type { ButtonProps } from "@mui/material/Button";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { PhoneRunOn } from "../PhoneNewSession/PhoneRunOn";
import { PhoneBottomBar } from "./PhoneBottomBar";
import { PhoneHarnessPicker } from "./PhoneHarnessPicker";
import type { PhoneStart } from "./usePhoneStart";
import { useImplementButton } from "./useImplementButton";

const noteSx = {
	px: 2.5,
	pt: 1,
	fontSize: 13,
	color: "text.secondary",
	textAlign: "center",
} as const;

export function PhoneItemActions({
	item,
	start,
}: {
	item: BacklogItem;
	start: PhoneStart;
}) {
	const implement = useImplementButton(item, start);
	const { cwd, refine } = start;
	const refineButton: ButtonProps = {
		children: refine.launched ? "Refining…" : "Refine",
		variant: implement ? "tonal" : "contained",
		disabled: !cwd || !refine.supported || refine.launched,
		onClick: refine.refine,
	};

	return (
		<PhoneBottomBar
			buttons={implement ? [implement, refineButton] : [refineButton]}
		>
			<PhoneRunOn form={start} />
			<PhoneHarnessPicker
				harnesses={start.harnesses}
				value={start.harness}
				onChange={start.setHarness}
			/>
			{!cwd && <Box sx={noteSx}>Not cloned on {start.node}</Box>}
			{cwd && !refine.supported && (
				<Box sx={noteSx}>
					Refine unavailable with {start.harness} on {start.node}
				</Box>
			)}
		</PhoneBottomBar>
	);
}
