// Rules behind weave-commit, with no Node or browser APIs, so the CLI, the
// commit-msg hook, the GitHub Action, and the demo page share them.
//
//   lintCommit(message) -> [{ n, level, rule, msg }]

const GENERIC = new Set([
  'update', 'updates', 'update code', 'updated code', 'update files', 'fix', 'fixes', 'fix bug', 'fix bugs', 'fix issue',
  'fix issues', 'fix stuff', 'bug fix', 'bug fixes', 'bugfix', 'improve performance', 'performance improvements',
  'add feature', 'new feature', 'refactor', 'refactoring', 'refactor code', 'wip', 'minor changes', 'minor fixes',
  'small fixes', 'changes', 'some changes', 'update dependencies', 'clean up', 'cleanup', 'clean up code', 'code cleanup',
  'misc', 'various fixes', 'various improvements', 'tweaks', 'improvements', 'stuff', 'test', 'tests', 'temp',
]);
const BUZZ = /\b(optimi[sz]e[sd]?|enhance[sd]?|enhancements?|streamline[sd]?|robust(?:ness)?|comprehensive|seamless(?:ly)?|improve ux|better performance|various improvements|overall improvements)\b/i;
const EMOJI = /\p{Extended_Pictographic}|:[a-z_]+:/u;
const PREFIX = /^(?:[a-z]+(?:\([^)]*\))?!?:|[A-Z][a-z]+:)\s*/;
const SKIP = /^(Merge |Revert "|fixup! |squash! |amend! |v?\d+\.\d+\.\d+$)/;

export function lintCommit(message) {
  const issues = [];
  const add = (n, level, rule, msg) => issues.push({ n, level, rule, msg });
  const lines = String(message).replace(/\r/g, '').split('\n');
  const content = lines.map((text, i) => ({ n: i + 1, text })).filter((l) => !l.text.startsWith('#'));
  const first = content.find((l) => l.text.trim());
  if (!first) {
    add(1, 'error', 'empty', 'the commit message is empty');
    return issues;
  }
  const subject = first.text.trim();
  if (SKIP.test(subject)) return issues;
  const description = subject.replace(PREFIX, '').trim();
  const normalized = description.toLowerCase().replace(/[.!]+$/, '').trim();

  if (EMOJI.test(subject)) add(first.n, 'error', 'emoji', 'emoji in the subject; use a plain type such as fix: or feat: (R-04)');
  if (!normalized || GENERIC.has(normalized)) {
    add(first.n, 'error', 'generic-subject', `"${subject}" names no change; say what changed, e.g. "fix: stop duplicate webhook processing on Stripe retry" (R-31)`);
  } else if (normalized.split(/\s+/).length < 3) {
    add(first.n, 'warning', 'thin-subject', `"${subject}" is too short to say what changed (R-31)`);
  }
  if (BUZZ.test(description)) add(first.n, 'warning', 'buzzword', `"${description.match(BUZZ)[0]}" claims an improvement without naming it (R-16)`);
  if (subject.length > 72) add(first.n, 'warning', 'subject-length', `subject is ${subject.length} characters; keep it under 72 (C-1)`);
  if (/[^.]\.$/.test(subject)) add(first.n, 'warning', 'subject-period', 'subject ends with a period (C-1)');

  const body = content.filter((l) => l.n > first.n);
  const prose = body.filter((l) => l.text.trim() && !/^[A-Za-z-]+: /.test(l.text));
  for (const l of prose) {
    if (/^\s*this (commit|pr|change) (updates|changes|fixes|adds|modifies|improves)\b/i.test(l.text)) {
      add(l.n, 'warning', 'echo-body', 'the body repeats the subject; keep it only for facts the subject does not carry (R-31)');
      break;
    }
  }
  if (prose.length > 20) add(body[0].n, 'warning', 'long-body', `${prose.length} body lines; keep the non-obvious why, migration notes, and breaking changes (R-31)`);
  return issues;
}
