import { prConcisenessGuidance } from "./prConcisenessGuidance";
import { resolvesBlurb } from "./resolvesBlurb";

const DRAFT_DEFAULT_ON = `This repo has prs.draft set, so a raise creates a draft pull request unless
--no-draft is passed.`;

const DRAFT_DEFAULT_OFF = `This repo leaves prs.draft off, so a raise creates a ready-for-review pull
request unless --draft is passed.`;

export function raiseGuidance(
	promptJira: boolean,
	promptGithub: boolean,
	draft: boolean,
): string {
	const resolves = resolvesBlurb(promptJira, promptGithub);
	const draftDefault = draft ? DRAFT_DEFAULT_ON : DRAFT_DEFAULT_OFF;
	return `Raise a pull request for the current branch. Use a concise description with no
headers, and do not reference Claude or any AI assistance in the title or body.

${draftDefault}

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

${prConcisenessGuidance}

If a pull request already exists for the branch, this command errors — pass
--force to fully overwrite its title and body, or use 'assist prs edit' to update
only individual sections (every other section of the existing body is preserved).`;
}
