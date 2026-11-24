import { run } from "./git.mjs";

const PLATE_CHECKS = process.env.KNDL_ROOT
  ? [
      {
        id: "lamina-01",
        label: "Lámina 01",
        command: "python3",
        args: ["scripts/build-lamina.py", "--verify", "--plate", "01"],
        env: { KNDL_ROOT: process.env.KNDL_ROOT },
        timeout: 120000,
        hint: "Instalá Python 3 y PyYAML (python3 -m pip install pyyaml)."
      },
      {
        id: "lamina-02",
        label: "Lámina 02",
        command: "python3",
        args: ["scripts/build-lamina.py", "--verify", "--plate", "02"],
        env: { KNDL_ROOT: process.env.KNDL_ROOT },
        timeout: 120000,
        hint: "Instalá Python 3 y PyYAML (python3 -m pip install pyyaml)."
      }
    ]
  : [];

export const CHECK_DEFINITIONS = [
  {
    id: "build",
    label: "Build Astro",
    command: "npm",
    args: ["run", "build"],
    env: { RIZOMA_BASE: "/rizoma" },
    timeout: 240000,
    hint: "Instalá Node 20+ y corré npm install."
  },
  {
    id: "links",
    label: "Check de enlaces internos",
    command: "npm",
    args: ["run", "links"],
    env: { RIZOMA_BASE: "/rizoma" },
    timeout: 120000,
    hint: "El check corre después del build; revisá dist/."
  },
  ...PLATE_CHECKS
];

function missingToolMessage(definition, result) {
  if (result.error?.includes("ENOENT") || result.code === "ENOENT") {
    return `${definition.command} no está instalado. ${definition.hint}`;
  }
  return null;
}

export async function runChecks(root, definitions = CHECK_DEFINITIONS) {
  const results = [];
  for (const definition of definitions) {
    const result = await run(definition.command, definition.args, {
      cwd: root,
      timeout: definition.timeout,
      env: definition.env
    });
    const missing = missingToolMessage(definition, result);
    results.push({
      id: definition.id,
      label: definition.label,
      command: definition.command,
      args: definition.args,
      ok: result.ok,
      code: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      message: missing ?? (result.ok ? "OK" : `Falló: ${definition.command} ${definition.args.join(" ")}`)
    });
  }
  return results;
}

export async function checkTools(root) {
  const checks = [
    { id: "node", command: "node", args: ["--version"] },
    { id: "git", command: "git", args: ["--version"] },
    { id: "npm", command: "npm", args: ["--version"] }
  ];
  if (process.env.KNDL_ROOT) {
    checks.push({
      id: "python3",
      command: "python3",
      args: ["-c", "import yaml,sys; print('ok ' + yaml.__version__)"]
    });
  }
  const tools = {};
  for (const check of checks) {
    const result = await run(check.command, check.args, { cwd: root, timeout: 20000 });
    tools[check.id] = {
      ok: result.ok,
      version: (result.stdout || result.stderr || "").trim().split("\n")[0] ?? "",
      message: result.ok ? null : `No se pudo ejecutar ${check.command}.`
    };
  }
  return tools;
}
