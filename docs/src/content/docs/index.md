---
id: index
title: assist
template: splash
hero:
  title: Run coding agents from backlog to pull request
  tagline: A dashboard and CLI for running coding agents (Claude Code, Codex or pi) across your repos, from a shared backlog through to verified commits and pull requests.
  actions:
    - text: Get started
      link: getting-started/
      icon: right-arrow
    - text: View on GitHub
      link: https://github.com/staff0rd/assist
      icon: github
      variant: minimal
---

```bash
npm install -g @staff0rd/assist
assist sync
```

::screenshot{file="sessions-dashboard.png"}

<section class="assist-landing" aria-labelledby="one-flow">
<div class="assist-landing-intro">
<p class="assist-landing-eyebrow">How it fits together</p>
<h2 id="one-flow">One flow, from idea to merged</h2>
</div>
<div class="assist-landing-flow">
<article class="assist-landing-row">
<div class="assist-landing-blurb">
<span class="assist-landing-step">01 · <strong>Plan</strong></span>
<h3>Draft work into a shared backlog</h3>
<p>Describe a story or bug and an agent drafts it with acceptance criteria and a phased plan, for you to review before anything runs.</p>
<a class="assist-landing-more" href="backlog/">Backlog <span class="assist-landing-arrow" aria-hidden="true">→</span></a>
</div>
<div class="assist-landing-shot">

::screenshot{file="backlog-plan.png"}

</div>
</article>
<article class="assist-landing-row">
<div class="assist-landing-blurb">
<span class="assist-landing-step">02 · <strong>Run</strong></span>
<h3>Run agents side by side</h3>
<p>Build an item or start a session from a prompt, and watch every agent across your repos from one dashboard.</p>
<a class="assist-landing-more" href="sessions-overview/">Sessions dashboard <span class="assist-landing-arrow" aria-hidden="true">→</span></a>
</div>
<div class="assist-landing-shot">

::screenshot{file="sessions-dashboard.png"}

</div>
</article>
<article class="assist-landing-row">
<div class="assist-landing-blurb">
<span class="assist-landing-step">03 · <strong>Review</strong></span>
<h3>Review the diff as it happens</h3>
<p>Open a session’s changes beside its terminal and comment on lines for the agent to address.</p>
<a class="assist-landing-more" href="sessions-diff/">Diff and file views <span class="assist-landing-arrow" aria-hidden="true">→</span></a>
</div>
<div class="assist-landing-shot">

::screenshot{file="sessions-diff-panel.png"}

</div>
</article>
<article class="assist-landing-row">
<div class="assist-landing-blurb">
<span class="assist-landing-step">04 · <strong>Ship</strong></span>
<h3>Verify, then raise the pull request</h3>
<p>Preview the pull request’s title and description, comment on it, and approve to raise it.</p>
<a class="assist-landing-more" href="pull-requests/">Pull requests <span class="assist-landing-arrow" aria-hidden="true">→</span></a>
</div>
<div class="assist-landing-shot">

::screenshot{file="sessions-pr-preview.png"}

</div>
</article>
</div>
</section>

<section class="assist-landing" aria-labelledby="beyond">
<div class="assist-landing-intro">
<p class="assist-landing-eyebrow">Beyond the dashboard</p>
<h2 id="beyond">Start work from where it lands</h2>
</div>
<div class="assist-landing-cards">
<article class="assist-landing-card assist-landing-card-wide">
<span class="assist-landing-card-label"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"></path></svg>Firefox extension</span>
<h3>Send a PR, issue or email to an agent</h3>
<p>An <strong>assist</strong> button on GitHub, Azure DevOps and Gmail pages starts a session from what you’re reading: review a pull request, address its comments or fix its conflicts.</p>

::screenshot{file="browser-extension-review-menu.png"}

<a class="assist-landing-more" href="browser-extension/">Browser extension <span class="assist-landing-arrow" aria-hidden="true">→</span></a>

</article>
<article class="assist-landing-card">
<span class="assist-landing-card-label"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"></rect><path d="M11 18h2"></path></svg>iOS app</span>
<h3>Check on sessions from your phone</h3>
<p>Watch your agents and answer the ones waiting on you, away from your desk.</p>

<a class="assist-landing-more" href="ios-app/">Install and connect <span class="assist-landing-arrow" aria-hidden="true">→</span></a>

</article>
</div>
<div class="assist-landing-also">
<span>Also connects to</span>
<a href="slack/">Slack</a>
<a href="jira/">Jira</a>
<a href="github-issues/">GitHub issues</a>
<a href="miro/">Miro</a>
<a href="litellm/">LiteLLM</a>
</div>
</section>
