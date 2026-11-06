import Box from "@mui/material/Box";
import { Fragment } from "react";
import { cardTokenNodes } from "./CardTokens/cardTokenNodes";
import type { SessionInfo } from "../../../../../../types";
import { reviewTargetPr } from "../../../../../reviewTargetPr";
import { usePrStatus } from "../../../../../usePrStatus";
import { useInRepoGroupContext } from "../../../../useInRepoGroupContext";
import { useItemTrackers } from "../../../../useItemTrackers";

const sepSx = { opacity: 0.35, mx: 0.5 } as const;

export function CardTokens({ session }: { session: SessionInfo }) {
	const grouped = useInRepoGroupContext();
	const trackerFor = useItemTrackers(session.cwd);
	const targetPr = reviewTargetPr(session) ?? session.promptPr;
	const pr = usePrStatus(session.cwd, targetPr, session.status);
	const tokens = cardTokenNodes(
		session,
		grouped,
		{ number: targetPr ?? pr?.number, url: pr?.url },
		trackerFor(session.activity?.itemId),
	);

	const separated = (index: number) =>
		index > 0 && !tokens[index].badge && !tokens[index - 1].badge;

	return (
		<>
			{tokens.map((token, index) => (
				<Fragment key={token.key}>
					{separated(index) && (
						<Box component="span" sx={sepSx}>
							·
						</Box>
					)}
					{token.node}
				</Fragment>
			))}
		</>
	);
}
