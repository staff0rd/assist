import refractor from "refractor/core";
import bash from "refractor/lang/bash";
import bicep from "refractor/lang/bicep";
import csharp from "refractor/lang/csharp";
import cshtml from "refractor/lang/cshtml";
import diff from "refractor/lang/diff";
import docker from "refractor/lang/docker";
import go from "refractor/lang/go";
import hcl from "refractor/lang/hcl";
import ini from "refractor/lang/ini";
import java from "refractor/lang/java";
import kotlin from "refractor/lang/kotlin";
import powershell from "refractor/lang/powershell";
import rust from "refractor/lang/rust";
import sql from "refractor/lang/sql";
import swift from "refractor/lang/swift";
import toml from "refractor/lang/toml";
import css from "refractor/lang/css";
import graphql from "refractor/lang/graphql";
import json from "refractor/lang/json";
import markdown from "refractor/lang/markdown";
import markup from "refractor/lang/markup";
import python from "refractor/lang/python";
import tsx from "refractor/lang/tsx";
import typescript from "refractor/lang/typescript";
import yaml from "refractor/lang/yaml";

for (const grammar of [
	markup,
	typescript,
	tsx,
	json,
	css,
	python,
	markdown,
	yaml,
	bash,
	graphql,
	bicep,
	csharp,
	cshtml,
	diff,
	docker,
	go,
	hcl,
	ini,
	java,
	kotlin,
	powershell,
	rust,
	sql,
	swift,
	toml,
]) {
	refractor.register(grammar);
}
export { refractor as refractorHighlighter };
