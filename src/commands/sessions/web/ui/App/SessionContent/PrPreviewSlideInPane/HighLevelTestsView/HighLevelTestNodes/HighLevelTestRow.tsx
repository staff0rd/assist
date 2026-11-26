import { Box } from "@mui/material";
import { useState } from "react";
import type { HighLevelTestCase } from "../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../HighLevelDiffComments";
import { highLevelTreeRowSx } from "../../highLevelTreeRowSx";
import { HighLevelTestSource } from "./HighLevelTestRow/HighLevelTestSource";
import { HighLevelTestToggle } from "./HighLevelTestRow/HighLevelTestToggle";

export function HighLevelTestRow({
	test,
	path,
	indent,
	comments,
}: {
	test: HighLevelTestCase;
	path: string;
	indent: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const [open, setOpen] = useState(false);
	return (
		<Box sx={{ minWidth: 0 }}>
			<Box sx={{ ...highLevelTreeRowSx, pl: indent }}>
				<HighLevelTestToggle
					name={test.name}
					writtenName={test.writtenName}
					change={test.change}
					open={open}
					onToggle={() => setOpen(!open)}
				/>
			</Box>
			{open && (
				<HighLevelTestSource
					test={test}
					path={path}
					indent={indent}
					comments={comments}
				/>
			)}
		</Box>
	);
}
