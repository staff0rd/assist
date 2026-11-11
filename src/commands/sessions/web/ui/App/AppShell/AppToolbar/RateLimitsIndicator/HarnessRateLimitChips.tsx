import Box from "@mui/material/Box";
import { Fragment } from "react";
import { harnessLabel } from "../../../../../../../../shared/harnessAdapters/harnessLabel";
import type { HarnessLimitGroup } from "./harnessLimitGroups";
import { chromeSecondary } from "./limitLevelChromeColor";
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
						sx={{ color: chromeSecondary, ml: i > 0 ? 1 : 0, mr: 0.5 }}
					>
						{harnessLabel(group.harness)}
					</Box>
					<RateLimitChips rateLimits={group.rateLimits} />
				</Fragment>
			))}
		</>
	);
}
