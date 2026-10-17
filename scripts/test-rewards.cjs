// Compile with the existing TypeScript dependency, then use Node's built-in runner.
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ts = require('typescript');

const project = path.resolve(__dirname, '..');
const output = mkdtempSync(path.join(tmpdir(), 'chebufit-rewards-test-'));
try {
  const program = ts.createProgram([path.join(project, 'src/features/rewards/index.ts')], {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    strict: true, skipLibCheck: true, noEmitOnError: true,
    types: [], outDir: output,
  });
  const emitted = program.emit();
  const diagnostics = [...ts.getPreEmitDiagnostics(program), ...emitted.diagnostics];
  if (diagnostics.length) {
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: name => name, getCurrentDirectory: () => project,
      getNewLine: () => '\n',
    }));
    process.exitCode = 1;
  } else {
    const result = spawnSync(process.execPath, ['--test', path.join(project, 'tests/rewards.test.cjs')], {
      stdio: 'inherit', env: { ...process.env, CHEBUFIT_REWARDS_BUILD: output },
    });
    if (result.error) console.error(result.error);
    process.exitCode = result.status ?? 1;
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}
