import Link from "@mui/material/Link";
import { Fragment } from "react";
import type { NextBoard } from "../../../../../../../next/types";

export function NextProjectLinks({
	projects,
	boards,
}: {
	projects: string[];
	boards: NextBoard[];
}) {
	return projects.map((project, index) => {
		const board = boards.find((candidate) => candidate.project === project);
		return (
			<Fragment key={project}>
				{index > 0 && ", "}
				{board?.url ? (
					<Link
						href={board.url}
						target="_blank"
						rel="noopener noreferrer"
						underline="hover"
						title={project}
					>
						{board.title}
					</Link>
				) : (
					project
				)}
			</Fragment>
		);
	});
}
