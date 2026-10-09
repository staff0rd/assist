import { prConcisenessGuidance } from "./prConcisenessGuidance";
import { screenshotGuidance } from "./screenshotGuidance";

export function editHelpText(): string {
	return `
Update individual sections of the current branch's pull request. Only the sections
you pass are replaced; every other section of the existing body is preserved.

Do not reference Claude or any AI assistance in the title or body. Wrap symbols,
file paths, function names, class names, variable names, config keys, CLI
commands, and flag names in backticks.

A replacement section is held to the same standard as one written by
'assist prs raise', and the budget applies to the resulting body as a whole — an
edit must not push the body over it. Read the sections you are not touching first:
if the section you are replacing was the concise one, trimming it further will not
rescue a body that is already long-winded.

  ## What  what is observably different for someone using or calling this.
  ## Why   the problem or motivation that made the change worth doing.
  ## How   only non-obvious decisions the diff alone won't explain; omit by
           default.

${screenshotGuidance} On edit, any supplied screenshots replace the existing
## Screenshots section rather than adding a second one, so pass the full set.

${prConcisenessGuidance}
`;
}
