import BashOriginal from "devicons-react/icons/BashOriginal";
import COriginal from "devicons-react/icons/COriginal";
import CplusplusOriginal from "devicons-react/icons/CplusplusOriginal";
import Css3Original from "devicons-react/icons/Css3Original";
import CsharpOriginal from "devicons-react/icons/CsharpOriginal";
import DockerOriginal from "devicons-react/icons/DockerOriginal";
import GoOriginal from "devicons-react/icons/GoOriginal";
import Html5Original from "devicons-react/icons/Html5Original";
import JavaOriginal from "devicons-react/icons/JavaOriginal";
import JavascriptOriginal from "devicons-react/icons/JavascriptOriginal";
import JsonOriginal from "devicons-react/icons/JsonOriginal";
import KotlinOriginal from "devicons-react/icons/KotlinOriginal";
import MarkdownOriginal from "devicons-react/icons/MarkdownOriginal";
import PhpOriginal from "devicons-react/icons/PhpOriginal";
import PowershellOriginal from "devicons-react/icons/PowershellOriginal";
import PythonOriginal from "devicons-react/icons/PythonOriginal";
import ReactOriginal from "devicons-react/icons/ReactOriginal";
import RubyOriginal from "devicons-react/icons/RubyOriginal";
import RustOriginal from "devicons-react/icons/RustOriginal";
import SassOriginal from "devicons-react/icons/SassOriginal";
import SwiftOriginal from "devicons-react/icons/SwiftOriginal";
import TerraformOriginal from "devicons-react/icons/TerraformOriginal";
import TypescriptOriginal from "devicons-react/icons/TypescriptOriginal";
import VuejsOriginal from "devicons-react/icons/VuejsOriginal";
import XmlOriginal from "devicons-react/icons/XmlOriginal";
import YamlOriginal from "devicons-react/icons/YamlOriginal";
import type { ComponentType } from "react";

type Devicon = ComponentType<{ size: number; fill?: string }>;

type DeviconEntry = { Icon: Devicon; unpaintedFill?: string };

const bash: DeviconEntry = { Icon: BashOriginal, unpaintedFill: "#4eaa25" };
const cpp: DeviconEntry = { Icon: CplusplusOriginal };
const css: DeviconEntry = { Icon: Css3Original };
const html: DeviconEntry = { Icon: Html5Original };
const js: DeviconEntry = { Icon: JavascriptOriginal };
const json: DeviconEntry = { Icon: JsonOriginal, unpaintedFill: "#d4a017" };
const kotlin: DeviconEntry = { Icon: KotlinOriginal };
const markdown: DeviconEntry = {
	Icon: MarkdownOriginal,
	unpaintedFill: "#519aba",
};
const react: DeviconEntry = { Icon: ReactOriginal };
const sass: DeviconEntry = { Icon: SassOriginal };
const ts: DeviconEntry = { Icon: TypescriptOriginal };
const xml: DeviconEntry = { Icon: XmlOriginal, unpaintedFill: "#e37933" };
const yaml: DeviconEntry = { Icon: YamlOriginal, unpaintedFill: "#cb4b16" };

export const deviconForExtension = (key: string): DeviconEntry | undefined =>
	devicons[key];

const devicons: Record<string, DeviconEntry> = {
	c: { Icon: COriginal },
	cc: cpp,
	cjs: js,
	cpp,
	cs: { Icon: CsharpOriginal },
	css,
	cts: ts,
	dockerfile: { Icon: DockerOriginal },
	go: { Icon: GoOriginal },
	h: { Icon: COriginal },
	hpp: cpp,
	htm: html,
	html,
	java: { Icon: JavaOriginal },
	js,
	json,
	jsonc: json,
	jsx: react,
	kt: kotlin,
	kts: kotlin,
	less: css,
	markdown,
	md: markdown,
	mdx: markdown,
	mjs: js,
	mts: ts,
	php: { Icon: PhpOriginal },
	ps1: { Icon: PowershellOriginal },
	py: { Icon: PythonOriginal },
	rb: { Icon: RubyOriginal },
	rs: { Icon: RustOriginal, unpaintedFill: "#b7410e" },
	sass,
	scss: sass,
	sh: bash,
	swift: { Icon: SwiftOriginal },
	tf: { Icon: TerraformOriginal },
	ts,
	tsx: react,
	vue: { Icon: VuejsOriginal },
	xml,
	yaml,
	yml: yaml,
	zsh: bash,
};
