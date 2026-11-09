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
import { useApiNode } from "../../useApiNode";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";
import { reviewModeEntries } from "../reviewModeEntries";
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
	const capabilities = useHarnessCapabilities(useApiNode());

	return (
		<Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle sx={(t) => reviewTypeDialogSx(t).title}>
				Review #{pr.number}: {pr.title}
			</DialogTitle>
			<DialogContent sx={{ px: 0 }}>
				<MenuList sx={(t) => reviewTypeDialogSx(t).list}>
					{reviewModeEntries(capabilities).map(({ label, args }) => (
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
					<PrActionItems
						pr={pr}
						capabilities={capabilities}
						onSelect={onSelect}
						onCancel={onCancel}
					/>
				</MenuList>
			</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>Cancel</Button>
			</DialogActions>
		</Dialog>
	);
}
