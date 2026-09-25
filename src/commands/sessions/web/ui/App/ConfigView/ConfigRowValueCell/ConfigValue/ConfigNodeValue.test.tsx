// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ConfigNode } from "../../../../../../../../shared/ConfigNode";
import { describeConfigNode } from "../../../../../../../../shared/describeConfigNode";
import { findConfigNode } from "../../../../../../../../shared/findConfigNode";
import { parseConfigPath } from "../../../../../../../../shared/parseConfigPath";
import { assistConfigSchema } from "../../../../../../../../shared/types";
import { ConfigNodeValue } from "./ConfigNodeValue";

afterEach(cleanup);

const schema = describeConfigNode(assistConfigSchema);

function node(key: string): ConfigNode {
	const path = parseConfigPath(key);
	const found = path ? findConfigNode(schema, path) : undefined;
	if (!found) throw new Error(`No node at ${key}`);
	return found;
}

function renderNode(key: string, value: unknown) {
	render(<ConfigNodeValue node={node(key)} value={value} />);
}

function textsUnder(label: string): string[] {
	const row = screen.getByText(label).parentElement;
	if (!row) throw new Error(`No row for ${label}`);
	return [...row.querySelectorAll("pre")].map((pre) => pre.textContent ?? "");
}

describe("ConfigNodeValue", () => {
	it("renders an array of objects as blocks of labelled fields", () => {
		renderNode("sql.connections", [
			{ name: "local", server: "localhost", port: 1433 },
			{ name: "prod", server: "db.example.com" },
		]);

		expect(textsUnder("port")).toEqual(["1433"]);
		expect(screen.getAllByText("server")).toHaveLength(2);
		expect(screen.getByText("local")).toBeTruthy();
		expect(screen.getByText("db.example.com")).toBeTruthy();
		expect(screen.queryByText(/^{/)).toBeNull();
	});

	it("renders a record as key/value rows, recursing into the value type", () => {
		renderNode("cliReadVerbs", { docker: ["ps", "logs"], kubectl: ["get"] });

		expect(textsUnder("docker")).toEqual(["ps", "logs"]);
		expect(textsUnder("kubectl")).toEqual(["get"]);
	});

	it("renders a list of scalars as one line per entry", () => {
		renderNode("worktree.copy", [".env", "settings.local.json"]);

		expect(screen.getByText(".env")).toBeTruthy();
		expect(screen.getByText("settings.local.json")).toBeTruthy();
	});

	it("labels an empty list and an empty record", () => {
		renderNode("worktree.copy", []);
		expect(screen.getByText("empty list")).toBeTruthy();

		cleanup();
		renderNode("cliReadVerbs", {});
		expect(screen.getByText("no entries")).toBeTruthy();
	});

	it("renders a run command entry through its command variant", () => {
		renderNode("run", [{ name: "build", command: "npm", args: ["run", "b"] }]);

		expect(screen.getByText("name")).toBeTruthy();
		expect(screen.getByText("command")).toBeTruthy();
		expect(textsUnder("args")).toEqual(["run", "b"]);
		expect(screen.queryByText("link")).toBeNull();
	});

	it("renders a run link entry through its link variant", () => {
		renderNode("run", [{ link: "shared.yml", prefix: "shared" }]);

		expect(textsUnder("link")).toEqual(["shared.yml"]);
		expect(textsUnder("prefix")).toEqual(["shared"]);
		expect(screen.queryByText("command")).toBeNull();
	});

	it("recurses into a run entry's params array and env record", () => {
		renderNode("run", [
			{
				name: "deploy",
				command: "sh",
				params: [{ name: "stage", required: true }],
				env: { LOG: "debug" },
			},
		]);

		expect(textsUnder("params")).toEqual(["stage", "true"]);
		expect(screen.getByText("required")).toBeTruthy();
		expect(screen.getAllByText("name")).toHaveLength(2);
		expect(textsUnder("LOG")).toEqual(["debug"]);
	});

	it("falls back to a formatted value when the value does not match the node", () => {
		renderNode("sql.connections", "not-a-list");

		expect(screen.getByText("not-a-list")).toBeTruthy();
	});
});
