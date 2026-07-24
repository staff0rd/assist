import { loadConfig } from "../../shared/loadConfig";

const RESOLVES_WITH_PROMPT = `  --resolves <key>  Jira issue key resolved by this PR; repeatable. Each key's
                    browse URL is appended inline to ## Why. Unless a Jira key is
                    already known from the session, ask the user whether this PR
                    resolves a Jira issue and for the key before raising; omit
                    --resolves only if they say there isn't one.`;

const RESOLVES_NO_PROMPT = `  --resolves <key>  Jira issue key resolved by this PR; repeatable. Each key's
                    browse URL is appended inline to ## Why. Pass it when a Jira
                    key is known from the session or supplied by the user; omit
                    it otherwise.`;

function guidance(promptJira: boolean): string {
	const resolves = promptJira ? RESOLVES_WITH_PROMPT : RESOLVES_NO_PROMPT;
	return `Raise a pull request for the current branch. Use a concise description with no
headers, and do not reference Claude or any AI assistance in the title or body.

The body is assembled from discrete section options; supply at minimum --title,
--what, and --why:

  --title <title>   short PR title.
  --what <what>     what the change does (rendered as ## What).
  --why <why>       why the change is needed (rendered as ## Why).
  --how <how>       optional; how the change works (rendered as ## How). Omit it
                    unless the approach genuinely needs explaining.
${resolves}

Wrap symbols, file paths, function names, class names, variable names, config
keys, CLI commands, and flag names in backticks.

One section, one question. Each section answers exactly one thing, and
implementation detail lives only in ## How:

  ## What  what is observably different for someone using or calling this, and
           nothing else. Not how it's built, not which functions/files changed.
  ## Why   the problem or motivation that made the change worth doing. Not how
           the solution works.
  ## How   only the non-obvious decisions the diff alone won't explain: a
           deliberate trade-off, a workaround, a reason the obvious approach was
           rejected. Omit it entirely by default. Never restate ## What as
           mechanism, and never walk through the diff.

The most common failure is altitude bleed: an implementation detail gets sprayed
into whichever section is being written — ## What narrates the diff, ## How
restates ## What, ## Why smuggles in mechanism. If a sentence describes a
mechanism, it belongs in ## How, and probably shouldn't exist at all unless it's
a genuine non-obvious decision. Litmus — a sentence is almost certainly mechanism
(so ## How, or cut it) if it contains "by …ing", "so that it can", "because the
X filters/needs/uses", or names an internal component, property, function, or
file.

Brevity budget — keep each section within these limits:

  ## What  a few sentences (2–3).
  ## Why   1–2 sentences.
  ## How   omit by default; a sentence or two, only for non-obvious decisions.

Write prose. A short paragraph is the natural form for ## What and ## Why —
bullets in ## What are a smell. Use bullets only when there are genuinely several
independent, parallel items (3+); a single bullet is never right. A single
non-list paragraph over ~600 characters or ~4 sentences is a wall of text and
will be rejected.

If a pull request already exists for the branch, this command errors — pass
--force to fully overwrite its title and body, or use 'assist prs edit' to update
only individual sections (every other section of the existing body is preserved).`;
}

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
is approved. The reviewer may also drop or paste screenshots into the pane; on
approval these are appended to the PR body under a ## Screenshots section
automatically (they are discarded on rejection), so you never author that section
yourself. Just compose the sections and run the command.`;

export function raiseHelpText(promptJira?: boolean): string {
	const prompt = promptJira ?? loadConfig().prs?.promptJira ?? false;
	const confirm =
		process.env.ASSIST_SESSION === "1" ? WEB_CONFIRM : TERMINAL_CONFIRM;
	return `\n${guidance(prompt)}\n\n${confirm}\n`;
}
