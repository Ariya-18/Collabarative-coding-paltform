const axios = require("axios");

const LANGUAGE_IDS = {
  javascript: 63, typescript: 74, python: 71, java: 62, cpp: 54, c: 50,
  csharp: 51, go: 60, rust: 73, swift: 83, kotlin: 78, scala: 81,
  ruby: 72, php: 68, lua: 64, perl: 85, bash: 46, r: 80,
  haskell: 61, ocaml: 65, elixir: 57, erlang: 58, sql: 82, assembly: 45,
};

const judge0 = axios.create({
  baseURL: process.env.JUDGE0_API_URL,
  headers: {
    "content-type": "application/json",
    "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
    "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
  },
  timeout: 20000,
});

const executeCode = async (code, language, input = "") => {
  const language_id = LANGUAGE_IDS[language];
  if (!language_id) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // wait=true → synchronous: Judge0 runs the code and returns the
  // result directly in this response, no polling needed.
  const { data } = await judge0.post("/submissions?base64_encoded=false&wait=true", {
    source_code: code,
    language_id,
    stdin: input,
  });

  return {
    stdout: data.stdout || "",
    stderr: data.stderr || "",
    compileOutput: data.compile_output || "",
    status: data.status?.description || "Unknown",
    time: data.time,
    memory: data.memory,
  };
};

module.exports = { executeCode, LANGUAGE_IDS };