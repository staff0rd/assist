import Stack from "@mui/material/Stack";
import { ChainToggle } from "./ChainToggle";
import type { PrPreviewChain } from "./PrPreviewChain";

export function PrPreviewChainToggles({
	chain,
	newPr,
	onChange,
}: {
	chain: PrPreviewChain;
	newPr: boolean;
	onChange: (chain: PrPreviewChain) => void;
}) {
	return (
		<Stack direction="row" sx={{ mr: "auto" }}>
			{newPr && (
				<ChainToggle
					label="Draft"
					title="Create the PR as a draft rather than ready for review"
					checked={chain.draft}
					onChange={(draft) =>
						onChange({
							...chain,
							draft,
							autoMerge: draft ? false : chain.autoMerge,
						})
					}
				/>
			)}
			<ChainToggle
				label="Auto-merge (squash)"
				title="Squash-merge the PR automatically once its required checks pass"
				checked={chain.autoMerge}
				onChange={(autoMerge) =>
					onChange({
						...chain,
						autoMerge,
						draft: autoMerge ? false : chain.draft,
					})
				}
			/>
			<ChainToggle
				label="Review"
				title="After raising, run a review that posts its findings and then addresses them"
				checked={chain.reviewAfter}
				onChange={(reviewAfter) => onChange({ ...chain, reviewAfter })}
			/>
			<ChainToggle
				label="Post"
				title="Announce the PR in Slack at the tail of the chain"
				checked={chain.announceAfter}
				onChange={(announceAfter) => onChange({ ...chain, announceAfter })}
			/>
		</Stack>
	);
}
