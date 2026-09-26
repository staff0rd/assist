// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { describeConfigNode } from "../../../../../shared/describeConfigNode";
import { REDACTED_SECRET } from "../../../../../shared/redactConfigSecrets";
import { assistConfigSchema } from "../../../../../shared/types";
import { configEntryNode } from "../../../../config/configEntryNode";
import type { ConfigEntry } from "../../../../config/readConfigEntries";
import { ConfigView } from "./ConfigView";
import { maskedSecretText } from "./ConfigView/ConfigRowValueCell/maskedSecretText";
import { RepoSelectionContext } from "../useRepoSelectionContext";

const schema = describeConfigNode(assistConfigSchema);

function node(key: string) {
	return configEntryNode(schema, key);
}

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

function stubEntries(entries: ConfigEntry[], ok = true) {
	const fetchMock = vi.fn().mockResolvedValue({
		ok,
		status: ok ? 200 : 500,
		json: async () => (ok ? entries : { error: "boom" }),
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

type SetResponse = { ok: boolean; status: number; body: unknown };

const SET_OK: SetResponse = {
	ok: true,
	status: 200,
	body: { target: "project" },
};

function stubApi(entries: ConfigEntry[], setResponse: SetResponse = SET_OK) {
	const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
		url.startsWith("/api/config/set")
			? {
					ok: setResponse.ok,
					status: setResponse.status,
					json: async () => setResponse.body,
				}
			: { ok: true, status: 200, json: async () => entries },
	);
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

function postedBody(fetchMock: ReturnType<typeof stubApi>, path: string) {
	const call = fetchMock.mock.calls.find(([url]) => String(url) === path);
	const init = call?.[1] as RequestInit | undefined;
	return JSON.parse(String(init?.body));
}

function lastSetBody(fetchMock: ReturnType<typeof stubApi>): unknown {
	return postedBody(fetchMock, "/api/config/set");
}

const UNSET_OK: SetResponse = {
	ok: true,
	status: 200,
	body: { target: "project", removed: true },
};

function stubUnsetApi(
	before: ConfigEntry[],
	after: ConfigEntry[] = before,
	response: SetResponse = UNSET_OK,
) {
	let cleared = false;
	const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
		if (String(url) === "/api/config/unset") {
			cleared = response.ok;
			return {
				ok: response.ok,
				status: response.status,
				json: async () => response.body,
			};
		}
		return {
			ok: true,
			status: 200,
			json: async () => (cleared ? after : before),
		};
	});
	vi.stubGlobal("fetch", fetchMock);
	return fetchMock;
}

const filterableEntries: ConfigEntry[] = [
	{
		key: "commit.pull",
		type: "boolean",
		value: true,
		source: "project",
		node: node("commit.pull"),
	},
	{
		key: "commit.push",
		type: "boolean",
		value: false,
		source: "project",
		node: node("commit.push"),
	},
	{
		key: "backup.dir",
		type: "string",
		value: "~/.assist/backups",
		source: "global",
		node: node("backup.dir"),
	},
];

const describedEntries: ConfigEntry[] = [
	{
		key: "commit.pull",
		type: "boolean",
		value: true,
		source: "project",
		node: node("commit.pull"),
		note: "Rebase onto the remote first",
	},
	{
		key: "backup.dir",
		type: "string",
		value: "~/.assist/backups",
		source: "global",
		node: node("backup.dir"),
		note: "Where archives are written",
	},
];

function keyFilter() {
	return screen.getByLabelText("Filter config keys and descriptions");
}

function renderView(selectedCwd = "/repo", path = "/config") {
	render(
		<MemoryRouter initialEntries={[path]}>
			<RepoSelectionContext.Provider
				value={{
					repos: [],
					selectedCwd,
					worktreeCwd: selectedCwd,
					setSelectedCwd: vi.fn(),
					cloneOn: (cwd) => cwd,
					originOf: () => undefined,
				}}
			>
				<ConfigView />
			</RepoSelectionContext.Provider>
		</MemoryRouter>,
	);
}

describe("ConfigView", () => {
	it("requests the config for the selected cwd and lists grouped keys", async () => {
		const fetchMock = stubEntries([
			{
				key: "commit.pull",
				type: "boolean",
				value: true,
				source: "project",
				node: node("commit.pull"),
			},
			{
				key: "backup.dir",
				type: "string",
				value: "~/.assist/backups",
				source: "global",
				node: node("backup.dir"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		expect(fetchMock).toHaveBeenCalledWith("/api/config?cwd=%2Frepo%2Fone");
		expect(screen.getByText("~/.assist/backups")).toBeTruthy();
		expect(screen.getByText("true")).toBeTruthy();
		expect(screen.getByText("backup")).toBeTruthy();
		expect(screen.getByText("commit")).toBeTruthy();
	});

	it("renders a complex leaf structurally and an unset leaf as not set", async () => {
		stubEntries([
			{
				key: "sql.connections",
				type: "array",
				value: [{ name: "local" }],
				source: "project",
				node: node("sql.connections"),
			},
			{
				key: "branch.prefix",
				type: "string",
				value: undefined,
				source: "default",
				node: node("branch.prefix"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.queryByText(/"name": "local"/)).toBeNull();
		expect(screen.getByText("local")).toBeTruthy();
		expect(screen.getByText("not set")).toBeTruthy();
	});

	it("renders a complex leaf from its descriptor, keeping source and default", async () => {
		stubEntries([
			{
				key: "voice.wakeWords",
				type: "array",
				itemType: "string",
				value: undefined,
				defaultValue: ["hey assist"],
				source: "default",
				node: node("voice.wakeWords"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("voice.wakeWords")).toBeTruthy(),
		);
		expect(screen.getByText("hey assist")).toBeTruthy();
		expect(screen.getByText("default")).toBeTruthy();
		expect(screen.queryByText(/\[/)).toBeNull();
	});

	it("shows the schema default and its source instead of 'not set'", async () => {
		stubEntries([
			{
				key: "worktree.enabled",
				type: "boolean",
				value: undefined,
				defaultValue: false,
				source: "default",
				node: node("worktree.enabled"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		expect(screen.getByText("false")).toBeTruthy();
		expect(screen.getByText("default")).toBeTruthy();
		expect(screen.queryByText("not set")).toBeNull();
	});

	it("shows the server error instead of rows when the fetch fails", async () => {
		stubEntries([], false);
		renderView();

		await waitFor(() => expect(screen.getByText("boom")).toBeTruthy());
	});

	it("saves a boolean edit to the project config and refetches", async () => {
		const fetchMock = stubApi([
			{
				key: "commit.push",
				type: "boolean",
				value: false,
				source: "project",
				node: node("commit.push"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));
		fireEvent.click(screen.getByLabelText("commit.push value"));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "commit.push",
				value: true,
				cwd: "/repo/one",
				scope: "project",
			}),
		);
		await waitFor(() =>
			expect(
				fetchMock.mock.calls.filter(
					([url]) => url === "/api/config?cwd=%2Frepo%2Fone",
				),
			).toHaveLength(2),
		);
	});

	it("writes to the global config when the global scope is picked", async () => {
		const fetchMock = stubApi([
			{
				key: "backup.dir",
				type: "string",
				value: "~/.assist/backups",
				source: "global",
				node: node("backup.dir"),
			},
		]);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit backup.dir" }));
		fireEvent.change(screen.getByLabelText("backup.dir"), {
			target: { value: "~/elsewhere" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Global" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "backup.dir",
				value: "~/elsewhere",
				cwd: "/repo",
				scope: "global",
			}),
		);
	});

	it("writes to this repo's entry in the global repos map", async () => {
		const fetchMock = stubApi(
			[
				{
					key: "worktree.enabled",
					type: "boolean",
					value: false,
					source: "default",
					repoKey: "assist",
					node: node("worktree.enabled"),
				},
			],
			{ ok: true, status: 200, body: { target: "repo", repoKey: "assist" } },
		);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.enabled" }),
		);
		expect(
			screen.getByRole("button", { name: "This repo" }).getAttribute("title"),
		).toBe("Not set in repos.assist in ~/.assist.yml");

		fireEvent.click(screen.getByRole("button", { name: "This repo" }));
		fireEvent.click(screen.getByLabelText("worktree.enabled value"));

		expect(
			screen.getByTestId("scope-dot-repo").getAttribute("data-state"),
		).toBe("unset");
		expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.enabled",
				value: true,
				cwd: "/repo/one",
				scope: "repo",
			}),
		);
	});

	it("names the windows host's config in the write-target hint and scope titles", async () => {
		stubApi([
			{
				key: "worktree.enabled",
				type: "boolean",
				value: false,
				source: "default",
				repoKey: "nextgen",
				globalConfigFile: "/mnt/c/Users/me/.assist.yml on the Windows host",
				node: node("worktree.enabled"),
			},
		]);
		renderView(String.raw`C:\git\nextgen`);

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.enabled" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "This repo" }));

		expect(screen.getByTestId("config-write-target").textContent).toBe(
			"This save writes to repos.nextgen in /mnt/c/Users/me/.assist.yml on the Windows host. Dots mark where the saved value lives now.",
		);
		expect(
			screen.getByRole("button", { name: "Global" }).getAttribute("title"),
		).toBe("Not set in /mnt/c/Users/me/.assist.yml on the Windows host");
	});

	it("saves back to the scope the effective value is already set at", async () => {
		const fetchMock = stubApi(
			[
				{
					key: "worktree.enabled",
					type: "boolean",
					value: true,
					source: "repo",
					sources: ["repo"],
					repoKey: "assist",
					node: node("worktree.enabled"),
				},
			],
			{ ok: true, status: 200, body: { target: "repo", repoKey: "assist" } },
		);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.enabled" }),
		);
		expect(
			screen
				.getByRole("button", { name: "This repo" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(screen.getByLabelText("worktree.enabled value"));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.enabled",
				value: false,
				cwd: "/repo/one",
				scope: "repo",
			}),
		);
	});

	it("saves an edited repo-scoped run command back to the repo scope", async () => {
		const fetchMock = stubApi(
			[
				{
					key: "run",
					type: "array",
					value: [{ name: "build", command: "npm run build" }],
					source: "repo",
					sources: ["repo"],
					layers: { repo: [{ name: "build", command: "npm run build" }] },
					repoKey: "assist",
					node: node("run"),
				},
			],
			{ ok: true, status: 200, body: { target: "repo", repoKey: "assist" } },
		);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit run[0]" }));
		fireEvent.change(screen.getByLabelText("run[0].command"), {
			target: { value: "npm run build -- --watch" },
		});
		expect(
			screen
				.getByRole("button", { name: "This repo" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			screen
				.getByRole("button", { name: "Project" })
				.getAttribute("aria-pressed"),
		).toBe("false");
		expect(screen.getByTestId("config-write-target").textContent).toBe(
			"This save writes to repos.assist in ~/.assist.yml. Dots mark where the saved value lives now.",
		);

		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "run",
				value: [{ name: "build", command: "npm run build -- --watch" }],
				cwd: "/repo/one",
				scope: "repo",
			}),
		);
		expect(
			fetchMock.mock.calls.filter(([url]) => String(url) === "/api/config/set")
				.length,
		).toBe(1);
	});

	it("preselects the repo scope for an item added to a repo-scoped array", async () => {
		stubApi(
			[
				{
					key: "run",
					type: "array",
					value: [{ name: "build", command: "npm run build" }],
					source: "repo",
					sources: ["repo"],
					layers: { repo: [{ name: "build", command: "npm run build" }] },
					repoKey: "planner-assistant",
					node: node("run"),
				},
			],
			{
				ok: true,
				status: 200,
				body: { target: "repo", repoKey: "planner-assistant" },
			},
		);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Add run entry" }));

		expect(
			screen
				.getByRole("button", { name: "This repo" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			screen.getByTestId("scope-dot-repo").getAttribute("data-state"),
		).toBe("effective");
		expect(screen.getByTestId("config-write-target").textContent).toBe(
			"This save writes to repos.planner-assistant in ~/.assist.yml. Dots mark where the saved value lives now.",
		);
	});

	it("forces a global write for a global-only key", async () => {
		const fetchMock = stubApi(
			[
				{
					key: "sync.autoConfirm",
					type: "boolean",
					value: false,
					source: "global",
					globalOnly: true,
					node: node("sync.autoConfirm"),
				},
			],
			{ ok: true, status: 200, body: { target: "global" } },
		);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sync.autoConfirm")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sync.autoConfirm" }),
		);
		const project = screen.getByRole("button", { name: "Project" });
		expect(project.hasAttribute("disabled")).toBe(true);
		expect(
			screen
				.getByRole("button", { name: "This repo" })
				.hasAttribute("disabled"),
		).toBe(true);
		expect(
			screen
				.getByRole("button", { name: "Global" })
				.getAttribute("aria-pressed"),
		).toBe("true");

		fireEvent.click(screen.getByLabelText("sync.autoConfirm value"));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "sync.autoConfirm",
				value: true,
				cwd: "/repo/one",
				scope: "global",
			}),
		);
	});

	it("shows a rejected value in the snackbar and keeps the editor open", async () => {
		stubApi(
			[
				{
					key: "commit.push",
					type: "boolean",
					value: false,
					source: "project",
					node: node("commit.push"),
				},
			],
			{
				ok: false,
				status: 400,
				body: { error: "commit.push: expected boolean" },
			},
		);
		renderView();

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(screen.getByText("commit.push: expected boolean")).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
	});

	it("offers the schema's options when editing an enum key", async () => {
		stubApi([
			{
				key: "sessions.linkVersionCheck",
				type: "enum",
				enumValues: ["block", "warn", "off"],
				value: "block",
				source: "default",
				node: node("sessions.linkVersionCheck"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sessions.linkVersionCheck")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sessions.linkVersionCheck" }),
		);
		fireEvent.mouseDown(screen.getByRole("combobox"));

		expect(screen.getByRole("option", { name: "warn" })).toBeTruthy();
	});

	it("picks advice.sections keys from the shipped names, with their titles", async () => {
		stubApi([
			{
				key: "advice.sections",
				type: "record",
				value: { verify: false },
				source: "project",
				node: node("advice.sections"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("advice.sections")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit advice.sections" }),
		);
		fireEvent.mouseDown(screen.getByRole("combobox"));

		expect(screen.getByRole("option", { name: /jira-context/ })).toBeTruthy();
		expect(
			screen.getByRole("option", { name: /Fetching Jira context/ }),
		).toBeTruthy();
	});

	it("edits a scalar union as text and lists the accepted types", async () => {
		const fetchMock = stubApi([
			{
				key: "worktree.install",
				type: "union",
				unionTypes: ["boolean", "string"],
				value: undefined,
				defaultValue: true,
				source: "default",
				node: node("worktree.install"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("worktree.install")).toBeTruthy(),
		);
		expect(screen.queryByText("read-only")).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.install" }),
		);
		expect(screen.getByText("boolean or string")).toBeTruthy();
		expect(screen.getByLabelText("worktree.install")).toHaveProperty(
			"value",
			"true",
		);
		fireEvent.change(screen.getByLabelText("worktree.install"), {
			target: { value: "pnpm install" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.install",
				value: "pnpm install",
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("edits an array of scalars as one entry per line", async () => {
		const fetchMock = stubApi([
			{
				key: "worktree.copy",
				type: "array",
				itemType: "string",
				value: [".env"],
				source: "project",
				node: node("worktree.copy"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("worktree.copy")).toBeTruthy());
		expect(screen.queryByText("read-only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Edit worktree.copy" }));
		expect(screen.getByLabelText("worktree.copy")).toHaveProperty(
			"value",
			".env",
		);
		fireEvent.change(screen.getByLabelText("worktree.copy"), {
			target: { value: ".env\n settings.local.json \n\n" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "worktree.copy",
				value: [".env", "settings.local.json"],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("adds an entry to an array of objects and posts the typed fields", async () => {
		const fetchMock = stubApi([
			{
				key: "sql.connections",
				type: "array",
				value: [],
				source: "default",
				node: node("sql.connections"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.queryByText("read-only")).toBeNull();
		expect(
			screen.queryByRole("button", { name: "Edit sql.connections" }),
		).toBeNull();
		expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
		fireEvent.click(
			screen.getByRole("button", { name: "Add sql.connections entry" }),
		);
		fireEvent.change(screen.getByLabelText("sql.connections[0].name"), {
			target: { value: "local" },
		});
		fireEvent.change(screen.getByLabelText("sql.connections[0].port"), {
			target: { value: "1433" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "sql.connections",
				value: [{ name: "local", port: 1433 }],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("reorders entries within the layer that owns them", async () => {
		const project = [
			{ name: "build", command: "npm" },
			{ name: "test", command: "vitest" },
		];
		const fetchMock = stubApi([
			{
				key: "run",
				type: "array",
				value: [{ name: "lint", command: "oxlint" }, ...project],
				source: "project",
				sources: ["project", "global"],
				layers: { project, global: [{ name: "lint", command: "oxlint" }] },
				node: node("run"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Move run[2] up" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "run",
				value: [
					{ name: "test", command: "vitest" },
					{ name: "build", command: "npm" },
				],
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("cannot move a run command out of its own layer", async () => {
		stubApi([
			{
				key: "run",
				type: "array",
				value: [
					{ name: "lint", command: "oxlint" },
					{ name: "build", command: "npm" },
				],
				source: "project",
				sources: ["project", "global"],
				layers: {
					project: [{ name: "build", command: "npm" }],
					global: [{ name: "lint", command: "oxlint" }],
				},
				node: node("run"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());

		expect(
			screen
				.getByRole("button", { name: "Move run[1] up" })
				.hasAttribute("disabled"),
		).toBe(true);
		expect(
			screen.getByLabelText(
				"run[1] is the first entry in this repo's assist.yml — entries cannot move across scopes",
			),
		).toBeTruthy();
	});

	it("adds a run command at the repo scope without copying the project's commands", async () => {
		const project = [
			{ name: "build", command: "npm run build" },
			{ name: "test", command: "vitest" },
		];
		const fetchMock = stubApi(
			[
				{
					key: "run",
					type: "array",
					value: project,
					source: "project",
					sources: ["project"],
					layers: { project },
					repoKey: "assist",
					node: node("run"),
				},
			],
			{ ok: true, status: 200, body: { target: "repo", repoKey: "assist" } },
		);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Add run entry" }));
		fireEvent.change(screen.getByLabelText("run[2].name"), {
			target: { value: "deploy" },
		});
		fireEvent.change(screen.getByLabelText("run[2].command"), {
			target: { value: "./deploy" },
		});
		fireEvent.click(screen.getByRole("button", { name: "This repo" }));
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "run",
				value: [{ name: "deploy", command: "./deploy" }],
				cwd: "/repo/one",
				scope: "repo",
			}),
		);
		expect(
			fetchMock.mock.calls.filter(([url]) => String(url) === "/api/config/set")
				.length,
		).toBe(1);
	});

	it("shows each run command's scope and offers its own save controls", async () => {
		stubApi([
			{
				key: "run",
				type: "array",
				value: [
					{ name: "lint", command: "oxlint" },
					{ name: "build", command: "npm" },
				],
				source: "project",
				sources: ["project", "global"],
				layers: {
					project: [{ name: "build", command: "npm" }],
					global: [{ name: "lint", command: "oxlint" }],
				},
				node: node("run"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("run")).toBeTruthy());
		const rows = screen.getAllByTestId("config-array-item");
		expect(within(rows[0] as HTMLElement).getByText("global")).toBeTruthy();
		expect(within(rows[1] as HTMLElement).getByText("project")).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Save" })).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Edit run[0]" }));

		expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
		expect(
			screen
				.getByRole("button", { name: "Global" })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(screen.getByTestId("config-write-target").textContent).toBe(
			"This save writes to ~/.assist.yml. Dots mark where the saved value lives now.",
		);
	});

	it("adds a key/value row to a record", async () => {
		const fetchMock = stubApi([
			{
				key: "cliReadVerbs",
				type: "record",
				value: { docker: ["ps"] },
				source: "project",
				node: node("cliReadVerbs"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("cliReadVerbs")).toBeTruthy());
		expect(screen.queryByText("read-only")).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Edit cliReadVerbs" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Add cliReadVerbs entry" }),
		);
		fireEvent.change(screen.getByLabelText("cliReadVerbs key 2"), {
			target: { value: "kubectl" },
		});
		fireEvent.change(screen.getByLabelText("cliReadVerbs.kubectl"), {
			target: { value: "get" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "cliReadVerbs",
				value: { docker: ["ps"], kubectl: ["get"] },
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("clears a project key and falls back to the schema default", async () => {
		const fetchMock = stubUnsetApi(
			[
				{
					key: "commit.push",
					type: "boolean",
					value: false,
					source: "project",
					node: node("commit.push"),
				},
			],
			[
				{
					key: "commit.push",
					type: "boolean",
					value: undefined,
					defaultValue: true,
					source: "default",
					node: node("commit.push"),
				},
			],
		);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));
		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(postedBody(fetchMock, "/api/config/unset")).toEqual({
				key: "commit.push",
				cwd: "/repo/one",
				scope: "project",
			}),
		);
		await waitFor(() => expect(screen.getByText("default")).toBeTruthy());
		expect(screen.getByText("true")).toBeTruthy();
		expect(screen.queryByText("project")).toBeNull();
	});

	it("clears a global-only key from the global config", async () => {
		const fetchMock = stubUnsetApi(
			[
				{
					key: "sync.autoConfirm",
					type: "boolean",
					value: true,
					source: "global",
					globalOnly: true,
					node: node("sync.autoConfirm"),
				},
			],
			[
				{
					key: "sync.autoConfirm",
					type: "boolean",
					value: undefined,
					defaultValue: false,
					source: "default",
					node: node("sync.autoConfirm"),
				},
			],
			{ ok: true, status: 200, body: { target: "global", removed: true } },
		);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sync.autoConfirm")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sync.autoConfirm" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(postedBody(fetchMock, "/api/config/unset")).toEqual({
				key: "sync.autoConfirm",
				cwd: "/repo/one",
				scope: "global",
			}),
		);
	});

	it("clears an array row without posting an empty list", async () => {
		const fetchMock = stubUnsetApi(
			[
				{
					key: "worktree.copy",
					type: "array",
					itemType: "string",
					value: [".env"],
					source: "project",
					node: node("worktree.copy"),
				},
			],
			[
				{
					key: "worktree.copy",
					type: "array",
					itemType: "string",
					value: undefined,
					source: "default",
					node: node("worktree.copy"),
				},
			],
		);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("worktree.copy")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit worktree.copy" }));
		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(postedBody(fetchMock, "/api/config/unset")).toEqual({
				key: "worktree.copy",
				cwd: "/repo/one",
				scope: "project",
			}),
		);
		expect(
			fetchMock.mock.calls.some(([url]) => String(url) === "/api/config/set"),
		).toBe(false);
		await waitFor(() => expect(screen.getByText("default")).toBeTruthy());
		expect(screen.queryByText("project")).toBeNull();
	});

	it("offers no clear control for a row already using the schema default", async () => {
		stubUnsetApi([
			{
				key: "commit.push",
				type: "boolean",
				value: undefined,
				defaultValue: true,
				source: "default",
				node: node("commit.push"),
			},
		]);
		renderView();

		await waitFor(() => expect(screen.getByText("commit.push")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit commit.push" }));

		expect(screen.getByRole("button", { name: "Save" })).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
	});

	it("shows a rejected clear in the snackbar and keeps the editor open", async () => {
		stubUnsetApi(
			[
				{
					key: "roam.clientId",
					type: "string",
					value: "id",
					source: "project",
					node: node("roam.clientId"),
				},
			],
			undefined,
			{
				ok: false,
				status: 400,
				body: { error: "roam: clientSecret requires clientId" },
			},
		);
		renderView();

		await waitFor(() => expect(screen.getByText("roam.clientId")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit roam.clientId" }));
		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(
				screen.getByText("roam: clientSecret requires clientId"),
			).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
	});

	it("marks which scopes hold a value before Clear is pressed", async () => {
		stubApi([
			{
				key: "worktree.trunk",
				type: "boolean",
				value: true,
				source: "project",
				sources: ["project", "global"],
				node: node("worktree.trunk"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.trunk")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.trunk" }),
		);

		expect(
			screen.getByTestId("scope-dot-project").getAttribute("data-state"),
		).toBe("effective");
		expect(
			screen.getByTestId("scope-dot-repo").getAttribute("data-state"),
		).toBe("unset");
		expect(
			screen.getByTestId("scope-dot-global").getAttribute("data-state"),
		).toBe("overridden");
		expect(
			screen.getByRole("button", { name: "Global" }).getAttribute("title"),
		).toBe("Set in ~/.assist.yml — overridden by Project");
		expect(
			screen.getByRole("button", { name: "Clear" }).getAttribute("title"),
		).toBe(
			"Remove worktree.trunk from this repo's assist.yml — falls back to Global",
		);

		fireEvent.click(screen.getByRole("button", { name: "Global" }));

		expect(
			screen.getByRole("button", { name: "Clear" }).getAttribute("title"),
		).toBe("Remove worktree.trunk from ~/.assist.yml — falls back to Project");
	});

	it("offers Clear only in the scopes that hold a value", async () => {
		stubApi([
			{
				key: "worktree.trunk",
				type: "boolean",
				value: true,
				source: "global",
				sources: ["global"],
				node: node("worktree.trunk"),
			},
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.trunk")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.trunk" }),
		);

		expect(
			screen.getByTestId("scope-dot-project").getAttribute("data-state"),
		).toBe("unset");
		expect(
			screen.getByTestId("scope-dot-global").getAttribute("data-state"),
		).toBe("effective");
		expect(
			screen.getByRole("button", { name: "Project" }).getAttribute("title"),
		).toBe("Not set in this repo's assist.yml");
		expect(
			screen.getByRole("button", { name: "Clear" }).getAttribute("title"),
		).toBe(
			"Remove worktree.trunk from ~/.assist.yml — reverts to the schema default",
		);

		fireEvent.click(screen.getByRole("button", { name: "Project" }));

		expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
	});

	it("reports that nothing was removed when the value vanished under it", async () => {
		stubUnsetApi(
			[
				{
					key: "worktree.trunk",
					type: "boolean",
					value: true,
					source: "project",
					sources: ["project"],
					node: node("worktree.trunk"),
				},
			],
			undefined,
			{ ok: true, status: 200, body: { target: "project", removed: false } },
		);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.trunk")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.trunk" }),
		);
		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(
				screen.getByText(
					"worktree.trunk is no longer set in this repo's assist.yml — nothing was removed.",
				),
			).toBeTruthy(),
		);
		expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
	});

	it("clears a repos override from the This repo scope", async () => {
		const fetchMock = stubUnsetApi(
			[
				{
					key: "worktree.enabled",
					type: "boolean",
					value: true,
					source: "repo",
					sources: ["repo"],
					repoKey: "assist",
					node: node("worktree.enabled"),
				},
			],
			undefined,
			{
				ok: true,
				status: 200,
				body: { target: "repo", repoKey: "assist", removed: true },
			},
		);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("worktree.enabled")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit worktree.enabled" }),
		);
		expect(
			screen.getByRole("button", { name: "Clear" }).getAttribute("title"),
		).toBe(
			"Remove worktree.enabled from repos.assist in ~/.assist.yml — reverts to the schema default",
		);

		fireEvent.click(screen.getByRole("button", { name: "Clear" }));

		await waitFor(() =>
			expect(postedBody(fetchMock, "/api/config/unset")).toEqual({
				key: "worktree.enabled",
				cwd: "/repo",
				scope: "repo",
			}),
		);
	});

	it("shows a set secret as hidden and an unset one as not set, with sources", async () => {
		stubApi([
			{
				key: "database.url",
				type: "string",
				secret: true,
				value: REDACTED_SECRET,
				source: "global",
				node: node("database.url"),
			},
			{
				key: "roam.clientSecret",
				type: "string",
				secret: true,
				value: undefined,
				source: "default",
				node: node("roam.clientSecret"),
			},
		]);
		renderView();

		await waitFor(() => expect(screen.getByText("database.url")).toBeTruthy());
		expect(screen.getByText(maskedSecretText)).toBeTruthy();
		expect(screen.getByText("not set")).toBeTruthy();
		expect(screen.getByText("global")).toBeTruthy();
		expect(screen.getByText("default")).toBeTruthy();
	});

	it("posts the marker back for a secret row saved without typing a value", async () => {
		const fetchMock = stubApi([
			{
				key: "database.url",
				type: "string",
				secret: true,
				value: REDACTED_SECRET,
				source: "project",
				node: node("database.url"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("database.url")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit database.url" }));
		expect(
			(screen.getByLabelText("database.url") as HTMLInputElement).value,
		).toBe(maskedSecretText);
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "database.url",
				value: REDACTED_SECRET,
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("clears the mask on focus and restores it when nothing is typed", async () => {
		const fetchMock = stubApi([
			{
				key: "database.url",
				type: "string",
				secret: true,
				value: REDACTED_SECRET,
				source: "project",
				node: node("database.url"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("database.url")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit database.url" }));
		const field = screen.getByLabelText("database.url") as HTMLInputElement;

		fireEvent.focus(field);
		expect(field.value).toBe("");

		fireEvent.blur(field);
		expect(field.value).toBe(maskedSecretText);

		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toMatchObject({
				value: REDACTED_SECRET,
			}),
		);
	});

	it("posts a typed secret in place of the marker", async () => {
		const fetchMock = stubApi([
			{
				key: "database.url",
				type: "string",
				secret: true,
				value: REDACTED_SECRET,
				source: "project",
				node: node("database.url"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() => expect(screen.getByText("database.url")).toBeTruthy());
		fireEvent.click(screen.getByRole("button", { name: "Edit database.url" }));
		fireEvent.change(screen.getByLabelText("database.url"), {
			target: { value: "postgres://new" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "database.url",
				value: "postgres://new",
				cwd: "/repo/one",
				scope: "project",
			}),
		);
	});

	it("keeps an untouched nested secret marked while a sibling field is edited", async () => {
		const fetchMock = stubApi([
			{
				key: "sql.connections",
				type: "array",
				value: [
					{
						name: "local",
						server: "localhost",
						port: 1433,
						user: "sa",
						password: REDACTED_SECRET,
						database: "app",
					},
				],
				source: "global",
				node: node("sql.connections"),
			},
		]);
		renderView("/repo/one");

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		fireEvent.click(
			screen.getByRole("button", { name: "Edit sql.connections[0]" }),
		);
		expect(
			(screen.getByLabelText("sql.connections[0].password") as HTMLInputElement)
				.value,
		).toBe(maskedSecretText);
		fireEvent.change(screen.getByLabelText("sql.connections[0].user"), {
			target: { value: "admin" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(lastSetBody(fetchMock)).toEqual({
				key: "sql.connections",
				value: [
					{
						name: "local",
						server: "localhost",
						port: 1433,
						user: "admin",
						password: REDACTED_SECRET,
						database: "app",
					},
				],
				cwd: "/repo/one",
				scope: "global",
			}),
		);
	});

	it("narrows the rows to the keys matching the filter", async () => {
		stubEntries(filterableEntries);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.change(keyFilter(), { target: { value: "COMMIT" } });

		expect(screen.getByText("commit.pull")).toBeTruthy();
		expect(screen.getByText("commit.push")).toBeTruthy();
		expect(screen.queryByText("backup.dir")).toBeNull();
		expect(screen.queryByText("backup")).toBeNull();
	});

	it("pre-fills the filter from the search query param", async () => {
		stubEntries([
			...filterableEntries,
			{
				key: "news.showInNav",
				type: "boolean",
				value: false,
				source: "default",
				node: node("news.showInNav"),
			},
		]);
		renderView("/repo", "/config?search=news");

		await waitFor(() =>
			expect(screen.getByText("news.showInNav")).toBeTruthy(),
		);
		expect(keyFilter()).toHaveProperty("value", "news");
		expect(screen.queryByText("commit.pull")).toBeNull();
		expect(screen.queryByText("backup.dir")).toBeNull();
	});

	it("restores the full list when the filter is cleared", async () => {
		stubEntries(filterableEntries);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.change(keyFilter(), { target: { value: "commit" } });
		expect(screen.queryByText("backup.dir")).toBeNull();

		fireEvent.click(
			screen.getByRole("button", { name: "Clear config filter" }),
		);

		expect(screen.getByText("backup.dir")).toBeTruthy();
		expect(screen.getByText("commit.pull")).toBeTruthy();
		expect(keyFilter()).toHaveProperty("value", "");
	});

	it("keeps the filter mounted when nothing matches", async () => {
		stubEntries(filterableEntries);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.change(keyFilter(), { target: { value: "nosuchkey" } });

		expect(
			screen.getByText("No keys or descriptions match “nosuchkey”."),
		).toBeTruthy();
		expect(keyFilter()).toBeTruthy();
		expect(screen.queryByText("commit")).toBeNull();
	});

	it("narrows the rows to a word that appears only in a description", async () => {
		stubEntries(describedEntries);
		renderView();

		await waitFor(() => expect(screen.getByText("backup.dir")).toBeTruthy());
		fireEvent.change(keyFilter(), { target: { value: "rebase" } });

		expect(screen.getByText("commit.pull")).toBeTruthy();
		expect(screen.queryByText("backup.dir")).toBeNull();
	});

	it("keeps a leaf the schema does not describe read-only", async () => {
		stubApi([
			{ key: "sql.connections", type: "array", value: [], source: "default" },
		]);
		renderView();

		await waitFor(() =>
			expect(screen.getByText("sql.connections")).toBeTruthy(),
		);
		expect(screen.getByText("read-only")).toBeTruthy();
		expect(
			screen.queryByRole("button", { name: "Edit sql.connections" }),
		).toBeNull();
	});
});
