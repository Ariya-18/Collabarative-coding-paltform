import {
  SiPython, SiJavascript, SiTypescript, SiCplusplus, SiC, SiSharp,
  SiOpenjdk, SiGo, SiRust, SiRuby, SiPhp, SiKotlin, SiSwift, SiScala,
  SiHaskell, SiPerl, SiLua, SiR, SiGnubash, SiSqlite, SiElixir,
  SiErlang, SiOcaml,
} from "react-icons/si";
import { Cpu } from "lucide-react";

// NOTE: These language_id values match Judge0 CE's public instance
// (ce.judge0.com) as of this writing. If you're self-hosting Judge0,
// confirm your own IDs via GET /languages before relying on them —
// self-hosted instances can differ slightly by build.
export const LANGUAGE_CATEGORIES = [
  {
    label: "Popular",
    languages: [
      { value: "javascript", label: "JavaScript", icon: SiJavascript, judge0Id: 63 },
      { value: "typescript", label: "TypeScript", icon: SiTypescript, judge0Id: 74 },
      { value: "python", label: "Python", icon: SiPython, judge0Id: 71 },
      { value: "java", label: "Java", icon: SiOpenjdk, judge0Id: 62 },
      { value: "cpp", label: "C++", icon: SiCplusplus, judge0Id: 54 },
      { value: "c", label: "C", icon: SiC, judge0Id: 50 },
    ],
  },
  {
    label: "Compiled Languages",
    languages: [
      { value: "csharp", label: "C#", icon: SiSharp, judge0Id: 51 },
      { value: "go", label: "Go", icon: SiGo, judge0Id: 60 },
      { value: "rust", label: "Rust", icon: SiRust, judge0Id: 73 },
      { value: "swift", label: "Swift", icon: SiSwift, judge0Id: 83 },
      { value: "kotlin", label: "Kotlin", icon: SiKotlin, judge0Id: 78 },
      { value: "scala", label: "Scala", icon: SiScala, judge0Id: 81 },
    ],
  },
  {
    label: "Scripting & Dynamic",
    languages: [
      { value: "ruby", label: "Ruby", icon: SiRuby, judge0Id: 72 },
      { value: "php", label: "PHP", icon: SiPhp, judge0Id: 68 },
      { value: "lua", label: "Lua", icon: SiLua, judge0Id: 64 },
      { value: "perl", label: "Perl", icon: SiPerl, judge0Id: 85 },
      { value: "bash", label: "Bash", icon: SiGnubash, judge0Id: 46 },
      { value: "r", label: "R", icon: SiR, judge0Id: 80 },
    ],
  },
  {
    label: "Functional & Others",
    languages: [
      { value: "haskell", label: "Haskell", icon: SiHaskell, judge0Id: 61 },
      { value: "ocaml", label: "OCaml", icon: SiOcaml, judge0Id: 65 },
      { value: "elixir", label: "Elixir", icon: SiElixir, judge0Id: 57 },
      { value: "erlang", label: "Erlang", icon: SiErlang, judge0Id: 58 },
      { value: "sql", label: "SQL (SQLite)", icon: SiSqlite, judge0Id: 82 },
      { value: "assembly", label: "Assembly", icon: Cpu, judge0Id: 45 },
    ],
  },
];

// Flat lookup used by the editor/room header for quick access
export const ALL_LANGUAGES = LANGUAGE_CATEGORIES.flatMap((c) => c.languages);

export const getLanguageByValue = (value) =>
  ALL_LANGUAGES.find((l) => l.value === value);