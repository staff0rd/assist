import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import type { HarnessKind } from "../../../../../../../../../../../shared/harnesses";
import { harnessLabel } from "../../../../../../../../../../../shared/harnessLabel";
import type { SessionModel } from "../../../sessionModel";
import { type Choice, ChoiceItem } from "./ChoiceItem";
import { modelChoices } from "./modelChoices";

export function HarnessMenu({
	anchor,
	harness,
	harnesses,
	model,
	onPick,
	onClose,
}: {
	anchor: HTMLElement | null;
	harness: HarnessKind;
	harnesses: HarnessKind[];
	model: SessionModel | undefined;
	onPick: (harness: HarnessKind) => void;
	onClose: () => void;
}) {
	const harnessChoices: Choice[] =
		harnesses.length > 1
			? harnesses.map((choice) => ({
					key: choice,
					label: harnessLabel(choice),
					checked: choice === harness,
					pick: () => onPick(choice),
				}))
			: [];
	const models = model ? modelChoices(model) : [];
	return (
		<Menu
			open={anchor !== null}
			anchorEl={anchor}
			onClose={onClose}
			slotProps={{ list: { dense: true, "aria-label": "Harness" } }}
		>
			{harnessChoices.map((choice) => (
				<ChoiceItem key={choice.key} choice={choice} onClose={onClose} />
			))}
			{harnessChoices.length > 0 && models.length > 0 && <Divider />}
			{models.length > 0 && (
				<ListSubheader sx={{ lineHeight: 2.5 }}>Model</ListSubheader>
			)}
			{models.map((choice) => (
				<ChoiceItem key={choice.key} choice={choice} onClose={onClose} />
			))}
		</Menu>
	);
}
