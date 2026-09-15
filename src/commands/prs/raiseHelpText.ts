import { loadConfig } from "../../shared/loadConfig";
import { raiseGuidance } from "./raiseGuidance";

const TERMINAL_CONFIRM = `Before running this command, the user must see the full proposed title and body —
do not assume they can see your reasoning or earlier tool output. Write the
complete title and body verbatim in your visible reply, then use the
AskUserQuestion tool to ask whether to create the PR, putting the full title and
body in the approve option's preview field. This confirmation is mandatory in
every permission mode, including auto-accept and bypass-permissions. If the user
requests changes, revise and confirm again before running.`;

const WEB_CONFIRM = `You are running inside an assist web session. When you run this command the
drafted title and body are shown automatically in a preview pane beside the
terminal in the web UI, for the user to approve or reject there — do NOT display
the title and body or ask for confirmation in the terminal. The command blocks
until the user decides: on approval it creates or updates the PR and reports it;
on rejection it exits non-zero with the reason. The reviewer may also attach
inline comments to specific spans of the preview; on rejection these are printed
as numbered quoted-span + note pairs on stderr. Address every comment (and the
reason), then run the command again to re-preview the revised PR. Repeat until it
is approved. The reviewer may also drop or paste screenshots or video into the
pane; on approval these are appended to the PR body under a ## Screenshots section
automatically (they are discarded on rejection), so you never author that section
yourself. Just compose the sections and run the command.`;

export function raiseHelpText(
	promptJira?: boolean,
	promptGithub?: boolean,
	draft?: boolean,
): string {
	const config = loadConfig().prs;
	const jira = promptJira ?? config?.promptJira ?? false;
	const github = promptGithub ?? config?.promptGithub ?? false;
	const draftDefault = draft ?? config?.draft ?? false;
	const confirm =
		process.env.ASSIST_SESSION === "1" ? WEB_CONFIRM : TERMINAL_CONFIRM;
	return `\n${raiseGuidance(jira, github, draftDefault)}\n\n${confirm}\n`;
}
