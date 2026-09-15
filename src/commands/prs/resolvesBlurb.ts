const RESOLVES_BOTH_PROMPT = `  --resolves <ref>  Jira issue key or GitHub issue resolved by this PR;
                    repeatable. A Jira key is appended inline to ## Why as its
                    browse URL; a GitHub reference (#123, owner/repo#123, or a
                    github.com issue URL) is appended as-is so that merging
                    closes the issue. Unless one is already known from the
                    session, ask the user whether this PR resolves a Jira or a
                    GitHub issue and for the key or reference before raising;
                    omit --resolves only if they say there isn't one.`;

const RESOLVES_GITHUB_PROMPT = `  --resolves <ref>  GitHub issue resolved by this PR; repeatable. Accepts #123,
                    owner/repo#123, or a github.com issue URL, appended inline to
                    ## Why so that merging closes the issue. Unless an issue is
                    already known from the session, ask the user whether this PR
                    resolves a GitHub issue and for the reference before raising;
                    omit --resolves only if they say there isn't one.`;

const RESOLVES_JIRA_PROMPT = `  --resolves <key>  Jira issue key resolved by this PR; repeatable. Each key's
                    browse URL is appended inline to ## Why. Unless a Jira key is
                    already known from the session, ask the user whether this PR
                    resolves a Jira issue and for the key before raising; omit
                    --resolves only if they say there isn't one.`;

const RESOLVES_NO_PROMPT = `  --resolves <key>  Jira issue key resolved by this PR; repeatable. Each key's
                    browse URL is appended inline to ## Why. Pass it when a Jira
                    key is known from the session or supplied by the user; omit
                    it otherwise.`;

export function resolvesBlurb(
	promptJira: boolean,
	promptGithub: boolean,
): string {
	if (promptJira && promptGithub) return RESOLVES_BOTH_PROMPT;
	if (promptGithub) return RESOLVES_GITHUB_PROMPT;
	if (promptJira) return RESOLVES_JIRA_PROMPT;
	return RESOLVES_NO_PROMPT;
}
