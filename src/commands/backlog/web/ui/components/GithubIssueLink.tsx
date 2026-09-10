import GitHubIcon from "@mui/icons-material/GitHub";
import { githubIssueUrl } from "../../../../../shared/githubIssueUrl";
import { githubIssueNumber } from "../../../githubIssueNumber";
import { shortenGithubIssue } from "../../../shortenGithubIssue";
import { TrackerLink, type TrackerLinkVariant } from "./TrackerLink";

type GithubIssueLinkProps = {
	githubIssue?: string;
	origin?: string;
	variant?: TrackerLinkVariant;
};

export function GithubIssueLink({
	githubIssue,
	origin,
	variant = "link",
}: GithubIssueLinkProps) {
	if (!githubIssue) return null;
	return (
		<TrackerLink
			label={
				variant === "icon"
					? githubIssueNumber(githubIssue)
					: shortenGithubIssue(githubIssue, origin)
			}
			title={githubIssue}
			url={githubIssueUrl(githubIssue)}
			icon={<GitHubIcon />}
			variant={variant}
		/>
	);
}
