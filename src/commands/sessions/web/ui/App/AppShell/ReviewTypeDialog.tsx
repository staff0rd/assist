import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	MenuItem,
	MenuList,
} from "@mui/material";
import { useState } from "react";
import type { PrSummary } from "../../../prList";
import { reviewButtonModes } from "../../../../../../shared/reviewButtonModes";
import {
	reviewOptionArgs,
	reviewOptionDefaults,
} from "../../../../../../shared/reviewOptionFlags";
import { ReviewOptionToggles } from "../ReviewOptionToggles";
import { PrActionItems } from "./ReviewTypeDialog/PrActionItems";
import { reviewTypeDialogSx } from "./ReviewTypeDialog/reviewTypeDialogSx";

export function ReviewTypeDialog({
	pr,
	onSelect,
	onCancel,
}: {
	pr: PrSummary;
	onSelect: (args: string[]) => void;
	onCancel: () => void;
}) {
	const [options, setOptions] = useState(reviewOptionDefaults);

	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle sx={(t) => reviewTypeDialogSx(t).title}>
				Review #{pr.number}: {pr.title}
			</DialogTitle>
			<DialogContent sx={{ px: 0 }}>
				<MenuList sx={(t) => reviewTypeDialogSx(t).list}>
					{reviewButtonModes.map(({ label, args }) => (
						<MenuItem
							key={label}
							onClick={() => onSelect([...args, ...reviewOptionArgs(options)])}
						>
							{label}
						</MenuItem>
					))}
					<Divider />
					<ReviewOptionToggles value={options} onChange={setOptions} />
					<Divider />
					<PrActionItems pr={pr} onSelect={onSelect} onCancel={onCancel} />
				</MenuList>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
}
