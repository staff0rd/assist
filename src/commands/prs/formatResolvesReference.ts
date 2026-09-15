import { normalizeGithubIssue } from "../backlog/associate-github/normalizeGithubIssue";
import { loadJson } from "../../shared/loadJson";

const SAME_REPO_PATTERN = /^#\d+$/;

function jiraBrowseUrl(key: string): string {
	const { site } = loadJson<{ site?: string }>("jira.json");
	return site ? `https://${site}/browse/${key}` : key;
}

export function formatResolvesReference(value: string): string {
	const trimmed = value.trim();
	if (SAME_REPO_PATTERN.test(trimmed)) return trimmed;
	return normalizeGithubIssue(trimmed) ?? jiraBrowseUrl(value);
}
