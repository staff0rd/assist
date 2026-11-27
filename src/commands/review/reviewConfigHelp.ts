import type { ConfigHelpEntry } from "../../shared/configHelp";
import { defaultCriticalPaths } from "../../shared/defaultCriticalPaths";

export const reviewConfigHelp: ConfigHelpEntry[] = [
	{
		key: "review.codexModel",
		setter: "assist config set review.codexModel gpt-5-codex",
		note: "optional; runs the codex reviewer on this model via the LiteLLM proxy (needs litellm.baseUrl and litellm.apiKey); codex-default runs it on codex's own configured model, overriding a value inherited from user or global config",
	},
	{
		key: "review.synthesisHarness",
		setter: "assist config set review.synthesisHarness <claude|codex>",
		note: "harness that consolidates the two reviews (default claude); when it cannot synthesise (e.g. its CLI is not on PATH) the review exits with the reason before reviewing instead of falling back to another harness",
	},
	{
		key: "review.highLevel.criticalPaths",
		setter:
			'assist config set review.highLevel.criticalPaths "**/*.graphql,en-AU/translation.json"',
		note: `comma-separated globs whose full diffs the high-level review shows; a value replaces the default (${defaultCriticalPaths.join(",")})`,
	},
	{
		key: "review.highLevel.uiPaths",
		setter: 'assist config set review.highLevel.uiPaths "src/ui/**"',
		note: "comma-separated globs that make a change a UI change, so --high-level requires a screenshot or video; unset requires none",
	},
	{
		key: "review.highLevel.descriptionWordCap",
		setter: "assist config set review.highLevel.descriptionWordCap 300",
		note: "word cap --high-level holds the PR description to (default 300)",
	},
	{
		key: "review.highLevel.testPaths",
		setter:
			'assist config set review.highLevel.testPaths "**/*.test.ts,e2e/**/*.spec.ts"',
		note: "comma-separated globs of test files whose describe/it hierarchy backs the tests item (default **/*.{test,spec}.{ts,tsx,js,jsx})",
	},
	{
		key: "review.highLevel.collapsedPaths",
		setter:
			'assist config set review.highLevel.collapsedPaths "**/*.test.*,**/generated/**"',
		note: "comma-separated globs whose files start collapsed in the high-level changed-files tree; every other file starts expanded (default **/*.test.*,**/generated/**)",
	},
	{
		key: "review.highLevel.requireLinkedIssue",
		setter: "assist config set review.highLevel.requireLinkedIssue false",
		note: "false drops the high-level check that the PR links the GitHub issue it resolves, for repos that do not track work in GitHub issues (default true)",
	},
	{
		key: "review.instance.composeFile",
		setter:
			"assist config set review.instance.composeFile docker-compose.review.yml",
		note: "compose file, relative to the repo root, that review instance brings a PR up with; it reads ASSIST_SRC_<SERVICE> (the PR checkout) and ASSIST_PORT_<SERVICE> (a free host port) for each configured service",
	},
	{
		key: "review.instance.services",
		setter: "assist config set review.instance.services.<service>.port 3000",
		note: "compose services review instance passes a checkout to in ASSIST_SRC_<SERVICE>; a service with a port (the one it listens on in its container) also gets a free host port in ASSIST_PORT_<SERVICE>, or its hostPort when set (e.g. `review.instance.services.web.hostPort 5173` for an auth redirect or CORS origin pinned to that port; two instances with the same hostPort cannot run at once). A service with a repo (path to a local clone of a companion repo, e.g. `review.instance.services.web.repo ../frontend`) builds from that repo at the head of its PR linked in the reviewed PR's body, else its default branch; others build from the reviewed PR",
	},
	{
		key: "review.instance.entry.service",
		setter: "assist config set review.instance.entry.service web",
		note: "service (with a port in review.instance.services) whose host port review instance prints as the instance URL",
	},
	{
		key: "review.instance.entry.path",
		setter: "assist config set review.instance.entry.path /app",
		note: "path appended to the instance URL (default /)",
	},
	{
		key: "review.instance.logs.services",
		setter:
			'assist config set review.instance.logs.services.<service>.ignore "favicon,retrying"',
		note: "per compose service log monitoring while review instance runs the steps: errorPatterns (case-insensitive regexes, default error,exception,fatal) flag a log line as an error that fails the step it was logged during, unless it also matches one of the service's ignore patterns",
	},
	{
		key: "review.instance.logs.browser.ignore",
		setter:
			'assist config set review.instance.logs.browser.ignore "ResizeObserver loop"',
		note: "case-insensitive regexes for browser console errors, uncaught page errors and 5xx responses (e.g. 500 GET <url>) that review instance ignores instead of failing the step",
	},
	{
		key: "review.instance.auth.strategy",
		setter: "assist config set review.instance.auth.strategy login-script",
		note: "how review instance signs in before running the steps; login-script runs review.instance.auth.loginScript.script once and starts every step from the signed-in browser state (unset runs signed out)",
	},
	{
		key: "review.instance.auth.loginScript.script",
		setter:
			"assist config set review.instance.auth.loginScript.script review/login.mjs",
		note: "JS module (ESM or CommonJS), relative to the repo root, whose default export receives { page, url, credentials: { username, password } } and signs in on the Playwright page; review instance fails with the script's error when it throws",
	},
	{
		key: "review.instance.auth.loginScript.username",
		setter:
			"assist config set review.instance.auth.loginScript.username reviewer@example.com",
		note: "username the login script receives as credentials.username",
	},
	{
		key: "review.instance.auth.loginScript.password",
		setter:
			"assist config set --node review.instance.auth.loginScript.password <password>",
		note: "secret the login script receives as credentials.password; required for the login-script strategy",
	},
];
