import type {
	NextIssue,
	NextPickup,
	NextPr,
	NextResponse,
} from "../../../../../next/types";

export type NextSectionsProps = {
	data: NextResponse;
	onStartPr: (pr: NextPr, cwd: string) => void;
	onStartIssue: (issue: NextIssue, cwd: string) => void;
	onStartPickup: (pickup: NextPickup, cwd: string) => void;
};
