import { useJiraSite } from "./useJiraSite";
import { TrackerLink } from "./TrackerLink";

type JiraKeyLinkProps = {
	jiraKey?: string;
	variant?: "link" | "chip";
};

export function JiraKeyLink({ jiraKey, variant = "link" }: JiraKeyLinkProps) {
	const site = useJiraSite();

	if (!jiraKey) return null;

	const url = site ? `https://${site}/browse/${jiraKey}` : undefined;

	return <TrackerLink label={jiraKey} url={url} variant={variant} />;
}
