import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Fragment } from "react";
import type { RuleScope } from "../../../../../rules/types";
import { scopeGroup } from "./scopeGroup";
import { ScopeButton } from "./ScopeButton";

type Props = {
	scopes: RuleScope[];
	selectedId: string | undefined;
	onSelect: (id: string) => void;
};

const groupSx = {
	display: "block",
	px: 1,
	pt: 1,
	pb: 0.25,
	color: "text.disabled",
	textTransform: "uppercase",
	letterSpacing: "0.06em",
} as const;

export function RuleScopeNav({ scopes, selectedId, onSelect }: Props) {
	return (
		<Paper
			variant="outlined"
			component="nav"
			aria-label="Rule scopes"
			sx={{ p: 1 }}
		>
			<List dense disablePadding>
				{scopes.map((scope, index) => {
					const group = scopeGroup(scope);
					const startsGroup =
						index === 0 || scopeGroup(scopes[index - 1]) !== group;
					return (
						<Fragment key={scope.id}>
							{startsGroup && (
								<Typography variant="caption" sx={groupSx}>
									{group}
								</Typography>
							)}
							<ScopeButton
								scope={scope}
								selected={scope.id === selectedId}
								onSelect={onSelect}
							/>
						</Fragment>
					);
				})}
			</List>
		</Paper>
	);
}
