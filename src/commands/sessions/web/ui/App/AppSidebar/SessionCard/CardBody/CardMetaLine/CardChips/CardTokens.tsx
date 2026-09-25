import Box from "@mui/material/Box";
import { Fragment } from "react";
import { cardTokenNodes } from "./CardTokens/cardTokenNodes";
import type { SessionInfo } from "../../../../../../types";
import { useInRepoGroupContext } from "../../../../useInRepoGroupContext";
import { useItemTrackers } from "../../../../useItemTrackers";
import { useTopBarLayoutContext } from "../../../../../useTopBarLayoutContext";

const sepSx = { opacity: 0.35, mx: 0.5 } as const;

export function CardTokens({ session }: { session: SessionInfo }) {
	const topBar = useTopBarLayoutContext();
	const grouped = useInRepoGroupContext();
	const trackerFor = useItemTrackers(session.cwd);
	const tokens = cardTokenNodes(
		session,
		topBar && grouped,
		trackerFor(session.activity?.itemId),
	);

	return (
		<>
			{tokens.map((token, index) => (
				<Fragment key={token.key}>
					{index > 0 && (
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
