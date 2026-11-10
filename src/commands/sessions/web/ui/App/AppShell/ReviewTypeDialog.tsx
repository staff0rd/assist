import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	MenuList,
} from "@mui/material";
import { useState } from "react";
import type { PrSummary } from "../../../prList";
import {
	reviewOptionArgs,
	reviewOptionDefaults,
} from "../../../../../../shared/reviewOptionFlags";
import { useApiNode } from "../../useApiNode";
import { useHarnessCapabilities } from "../../useHarnessCapabilities";
import { ReviewOptionToggles } from "../ReviewOptionToggles";
import { PrActionItems } from "./ReviewTypeDialog/PrActionItems";
import { ReviewModeMenuItems } from "./ReviewTypeDialog/ReviewModeMenuItems";
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
					<ReviewModeMenuItems
						capabilities={capabilities}
						onSelect={(args) =>
							onSelect([...args, ...reviewOptionArgs(options)])
						}
					/>
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
