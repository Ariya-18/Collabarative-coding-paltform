const axios = require("axios");

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

const LANGUAGE_IDS = {
  javascript: 63, // Node.js
  python: 71,     // Python 3
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // OpenJDK 13
};

const executeCode = async (language, code, stdin = "") => {
  const language_id = LANGUAGE_IDS[language];
  if (!language_id) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const headers = { "Content-Type": "application/json" };
  if (JUDGE0_API_KEY) {
    headers["X-RapidAPI-Key"] = JUDGE0_API_KEY;
    headers["X-RapidAPI-Host"] = JUDGE0_API_HOST;
  }

  const { data } = await axios.post(
    `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
    { source_code: code, language_id, stdin },
    { headers, timeout: 15000 }
  );

  return {
    stdout: data.stdout,
    stderr: data.stderr,
    compile_output: data.compile_output,
    status: data.status?.description || "Unknown",
    time: data.time,
    memory: data.memory,
  };
};

module.exports = { executeCode, LANGUAGE_IDS };