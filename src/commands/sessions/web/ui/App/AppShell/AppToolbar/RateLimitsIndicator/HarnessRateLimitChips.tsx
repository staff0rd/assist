import Box from "@mui/material/Box";
import { Fragment } from "react";
import { harnessLabel } from "../../../../../../../../shared/harnessLabel";
import type { HarnessLimitGroup } from "./harnessLimitGroups";
import { RateLimitChips } from "./RateLimitChips";

export function HarnessRateLimitChips({
	groups,
}: {
	groups: HarnessLimitGroup[];
}) {
	return (
		<>
			{groups.map((group, i) => (
				<Fragment key={group.harness}>
					<Box
						component="span"
						sx={{ color: "text.secondary", ml: i > 0 ? 1 : 0, mr: 0.5 }}
					>
						{harnessLabel(group.harness)}
					</Box>
					<RateLimitChips rateLimits={group.rateLimits} />
				</Fragment>
			))}
		</>
	);
}
