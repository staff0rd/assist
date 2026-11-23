import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveBaseRepo } from "../prs/resolveBaseRepo";
import { azureDevopsRemote } from "./azureDevopsRemote";
import { prCliCommands } from "./prCliCommands";

vi.mock("./azureDevopsRemote", () => ({ azureDevopsRemote: vi.fn() }));
vi.mock("../prs/resolveBaseRepo", () => ({ resolveBaseRepo: vi.fn() }));

const mockRemote = vi.mocked(azureDevopsRemote);
const mockBaseRepo = vi.mocked(resolveBaseRepo);

const ORIGIN = { org: "Turtlator", repo: "assist" };
const PARENT = { org: "staff0rd", repo: "assist" };

beforeEach(() => {
	vi.clearAllMocks();
	mockRemote.mockReturnValue(null);
	mockBaseRepo.mockReturnValue({ base: ORIGIN, origin: ORIGIN, mode: "auto" });
});

describe("prCliCommands", () => {
	it("uses gh against the clone's repo for a GitHub clone", () => {
		const commands = prCliCommands("12", "/repo");
		expect(commands.checkout).toEqual({
			file: "gh",
			args: ["pr", "checkout", "12", "-R", "Turtlator/assist"],
		});
		expect(commands.headBranch.parse("feature\n")).toBe("feature");
		expect(mockBaseRepo).toHaveBeenCalledWith(undefined, "/repo");
	});

	it("targets the parent repo's PR in a fork clone", () => {
		mockBaseRepo.mockReturnValue({
			base: PARENT,
			origin: ORIGIN,
			mode: "auto",
		});
		const commands = prCliCommands("12", "/repo");
		expect(commands.checkout.args).toEqual([
			"pr",
			"checkout",
			"12",
			"-R",
			"staff0rd/assist",
		]);
		expect(commands.headBranch.args).toEqual([
			"pr",
			"view",
			"12",
			"--json",
			"headRefName",
			"-q",
			".headRefName",
			"-R",
			"staff0rd/assist",
		]);
	});

	it("leaves the repo to gh when no GitHub remote resolves", () => {
		mockBaseRepo.mockReturnValue(null);
		expect(prCliCommands("12", "/repo").checkout.args).toEqual([
			"pr",
			"checkout",
			"12",
		]);
	});

	it("uses az repos pr for an Azure DevOps clone", () => {
		mockRemote.mockReturnValue({ org: "acme", project: "p", repo: "r" });
		const commands = prCliCommands("42", "/repo");
		expect(commands.checkout).toEqual({
			file: "az",
			args: ["repos", "pr", "checkout", "--id", "42"],
		});
		expect(commands.headBranch.args).toEqual(
			expect.arrayContaining(["show", "--id", "42", "sourceRefName"]),
		);
		expect(commands.headBranch.parse("refs/heads/feature/x\n")).toBe(
			"feature/x",
		);
		expect(commands.headBranch.parse("\n")).toBeNull();
		expect(mockBaseRepo).not.toHaveBeenCalled();
	});
});
