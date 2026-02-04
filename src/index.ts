#!/usr/bin/env node
import { execSync } from "node:child_process";
import { Command } from "commander";
import { commit } from "./commands/commit";
import {
	cyclomatic as complexityCyclomatic,
	halstead as complexityHalstead,
	maintainability as complexityMaintainability,
	sloc as complexitySloc,
} from "./commands/complexity";
import { init as deployInit } from "./commands/deploy/init";
import { redirect as deployRedirect } from "./commands/deploy/redirect";
import {
	list as devlogList,
	next as devlogNext,
	skip as devlogSkip,
	version as devlogVersion,
} from "./commands/devlog";
import { init } from "./commands/init";
import { init as lintInit } from "./commands/lint/init";
import { lint } from "./commands/lint/lint";
import { newProject } from "./commands/new/newProject";
import { notify } from "./commands/notify";
import {
	prs,
	fixed as prsFixed,
	listComments as prsListComments,
	printComments as prsPrintComments,
	wontfix as prsWontfix,
} from "./commands/prs/index";
import {
	check as refactorCheck,
	ignore as refactorIgnore,
} from "./commands/refactor";
import { run, add as runAdd } from "./commands/run";
import { statusLine } from "./commands/statusLine";
import { sync } from "./commands/sync";
import {
	configure as transcriptConfigure,
	format as transcriptFormat,
	summarise as transcriptSummarise,
} from "./commands/transcript";
import {
	hardcodedColors as verifyHardcodedColors,
	init as verifyInit,
	run as verifyRun,
} from "./commands/verify";
import { init as vscodeInit } from "./commands/vscode";

const program = new Command();

program.name("assist").description("CLI application").version("1.0.0");

program
	.command("sync")
	.description("Copy command files to ~/.claude/commands")
	.action(sync);

program
	.command("init")
	.description("Initialize VS Code and verify configurations")
	.action(init);

program
	.command("commit <message>")
	.description("Create a git commit with validation")
	.action(commit);

program
	.command("update")
	.description("Update claude-code to the latest version")
	.action(() => {
		console.log("Updating claude-code...");
		execSync("npm install -g @anthropic-ai/claude-code", { stdio: "inherit" });
	});

const prsCommand = program
	.command("prs")
	.description("Pull request utilities")
	.option("--open", "List only open pull requests")
	.option("--closed", "List only closed pull requests")
	.action(prs);

prsCommand
	.command("list-comments")
	.description("List all comments on the current branch's pull request")
	.action(() => {
		prsListComments().then(prsPrintComments);
	});

prsCommand
	.command("fixed <comment-id> <sha>")
	.description("Reply with commit link and resolve thread")
	.action((commentId: string, sha: string) => {
		prsFixed(Number.parseInt(commentId, 10), sha);
	});

prsCommand
	.command("wontfix <comment-id> <reason>")
	.description("Reply with reason and resolve thread")
	.action((commentId: string, reason: string) => {
		prsWontfix(Number.parseInt(commentId, 10), reason);
	});

const runCommand = program
	.command("run")
	.description("Run a configured command from assist.yml")
	.argument("<name>", "Name of the configured command")
	.argument("[args...]", "Arguments to pass to the command")
	.allowUnknownOption()
	.action((name, args) => {
		run(name, args);
	});

runCommand
	.command("add")
	.description("Add a new run configuration to assist.yml")
	.allowUnknownOption()
	.allowExcessArguments()
	.action(() => runAdd());

program
	.command("new")
	.description("Initialize a new Vite React TypeScript project")
	.action(newProject);

const verifyCommand = program
	.command("verify")
	.description("Run all verify:* scripts from package.json in parallel")
	.option("--timer", "Show timing information for each task as they complete")
	.action((options) => verifyRun(options));

verifyCommand
	.command("init")
	.description("Add verify scripts to a project")
	.action(verifyInit);

verifyCommand
	.command("hardcoded-colors")
	.description("Check for hardcoded hex colors in src/")
	.action(verifyHardcodedColors);

const lintCommand = program
	.command("lint")
	.description("Run lint checks for conventions not enforced by biomejs")
	.action(lint);

lintCommand
	.command("init")
	.description("Initialize Biome with standard linter config")
	.action(lintInit);

const refactorCommand = program
	.command("refactor")
	.description("Run refactoring checks for code quality");

refactorCommand
	.command("check [pattern]")
	.description("Check for files that exceed the maximum line count")
	.option("--modified", "Check only staged and unstaged files")
	.option("--staged", "Check only staged files")
	.option("--unstaged", "Check only unstaged files")
	.option(
		"--max-lines <number>",
		"Maximum lines allowed per file (default: 100)",
		Number.parseInt,
	)
	.action(refactorCheck);

refactorCommand
	.command("ignore <file>")
	.description("Add a file to the refactor ignore list")
	.action(refactorIgnore);

const devlogCommand = program
	.command("devlog")
	.description("Development log utilities");

devlogCommand
	.command("list")
	.description("Group git commits by date")
	.option(
		"--days <number>",
		"Number of days to show (default: 30)",
		Number.parseInt,
	)
	.option("--since <date>", "Only show commits since this date (YYYY-MM-DD)")
	.option("-r, --reverse", "Show earliest commits first")
	.option("-v, --verbose", "Show file names for each commit")
	.action(devlogList);

devlogCommand
	.command("version")
	.description("Show current repo name and version info")
	.action(devlogVersion);

devlogCommand
	.command("next")
	.description("Show commits for the day after the last versioned entry")
	.option("-v, --verbose", "Show file names for each commit")
	.action(devlogNext);

devlogCommand
	.command("skip <date>")
	.description("Add a date (YYYY-MM-DD) to the skip list")
	.action(devlogSkip);

const vscodeCommand = program
	.command("vscode")
	.description("VS Code configuration utilities");

vscodeCommand
	.command("init")
	.description("Add VS Code configuration files")
	.action(vscodeInit);

const deployCommand = program
	.command("deploy")
	.description("Netlify deployment utilities");

deployCommand
	.command("init")
	.description("Initialize Netlify project and configure deployment")
	.action(deployInit);

deployCommand
	.command("redirect")
	.description("Add trailing slash redirect script to index.html")
	.action(deployRedirect);

program
	.command("status-line")
	.description("Format Claude Code status line from JSON stdin")
	.action(statusLine);

program
	.command("notify")
	.description(
		"Show notification from Claude Code hook (reads JSON from stdin)",
	)
	.action(notify);

const complexityCommand = program
	.command("complexity")
	.description("Analyze TypeScript code complexity metrics");

complexityCommand
	.command("cyclomatic [pattern]")
	.description("Calculate cyclomatic complexity per function")
	.option("--threshold <number>", "Max complexity threshold", Number.parseInt)
	.action(complexityCyclomatic);

complexityCommand
	.command("halstead [pattern]")
	.description("Calculate Halstead metrics per function")
	.option("--threshold <number>", "Max volume threshold", Number.parseInt)
	.action(complexityHalstead);

complexityCommand
	.command("maintainability [pattern]")
	.description("Calculate maintainability index per file")
	.option(
		"--threshold <number>",
		"Min maintainability threshold",
		Number.parseInt,
	)
	.action(complexityMaintainability);

complexityCommand
	.command("sloc [pattern]")
	.description("Count source lines of code per file")
	.option("--threshold <number>", "Max lines threshold", Number.parseInt)
	.action(complexitySloc);

const transcriptCommand = program
	.command("transcript")
	.description("Meeting transcript utilities");

transcriptCommand
	.command("configure")
	.description("Configure transcript directories")
	.action(transcriptConfigure);

transcriptCommand
	.command("format")
	.description("Convert VTT files to formatted markdown transcripts")
	.action(transcriptFormat);

transcriptCommand
	.command("summarise")
	.description("List transcripts that do not have summaries")
	.action(transcriptSummarise);

program.parse();
