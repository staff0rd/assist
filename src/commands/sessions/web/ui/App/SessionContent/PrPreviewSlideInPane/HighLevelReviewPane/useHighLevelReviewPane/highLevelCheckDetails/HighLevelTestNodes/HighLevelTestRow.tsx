import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import { Box, IconButton } from "@mui/material";
import { useState } from "react";
import type { HighLevelTestCase } from "../../../../../../../../../../review/highLevel/types";
import { highLevelTreeRowSx } from "../highLevelTreeRowSx";
import { HighLevelTestNote } from "./HighLevelTestRow/HighLevelTestNote";
import { HighLevelTestSource } from "./HighLevelTestRow/HighLevelTestSource";
import { HighLevelTestToggle } from "./HighLevelTestRow/HighLevelTestToggle";

export function HighLevelTestRow({
	test,
	path,
	indent,
	note,
	onNote,
}: {
	test: HighLevelTestCase;
	path: string;
	indent: string;
	note: string;
	onNote: (note: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [commenting, setCommenting] = useState(false);
	return (
		<Box sx={{ minWidth: 0 }}>
			<Box sx={{ ...highLevelTreeRowSx, pl: indent }}>
				<HighLevelTestToggle
					name={test.name}
					open={open}
					onToggle={() => setOpen(!open)}
				/>
				<IconButton
					size="small"
					onClick={() => setCommenting(!commenting)}
					aria-label={`Comment on the test ${test.name}`}
					color={note ? "primary" : "default"}
					sx={{ p: 0.25, flexShrink: 0 }}
				>
					<ModeCommentOutlinedIcon sx={{ fontSize: 14 }} />
				</IconButton>
			</Box>
			{(commenting || note !== "") && (
				<HighLevelTestNote
					name={test.name}
					note={note}
					indent={indent}
					autoFocus={commenting && note === ""}
					onNote={onNote}
				/>
			)}
			{open && <HighLevelTestSource test={test} path={path} indent={indent} />}
		</Box>
	);
}
