import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { dateString, type Doc, type ExploracionData } from './content';

const ROOT = process.cwd();
const REPO = process.env.RIZOMA_REPO || 'hugomoraga/rizoma';

function git(args: string[]): string | undefined {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return undefined;
  }
}

function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  try {
    return (yaml.load(match[1]) as Record<string, any>) || {};
  } catch {
    return {};
  }
}

function corpusUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (item && typeof item === 'object' ? (item as any).url : item))
    .filter(Boolean)
    .map(String);
}

export interface Version {
  sha: string;
  short: string;
  date: string;
  message: string;
  title?: string;
  question?: string;
  summary?: string;
  status?: string;
  nodos: string[];
  corpus: any[];
  relacionadas: string[];
  url_commit: string;
  url_file: string;
  url_raw: string;
  url_compare?: string;
  changes: string[];
}

export function buildHistory(relativePath: string): Version[] {
  const log = git(['log', '--follow', '--format=@@%H%x1f%aI%x1f%s', '--name-only', '--', relativePath]);
  if (!log) return [];

  const versions: Version[] = [];
  for (const block of log.split('@@').filter(Boolean)) {
    const lines = block.split('\n').filter(Boolean);
    const header = lines.shift();
    if (!header) continue;
    const [sha, date, message] = header.split('\x1f');
    const filePath = lines[0]?.trim();
    if (!sha || !filePath) continue;

    const content = git(['show', `${sha}:${filePath}`]);
    if (content === undefined) continue;

    const data = parseFrontmatter(content);
    versions.push({
      sha,
      short: sha.slice(0, 7),
      date: dateString(date) || String(date),
      message: message || '',
      title: data.title,
      question: data.question,
      summary: data.summary,
      status: data.status,
      nodos: data.nodos || data.concepts || [],
      corpus: data.corpus || [],
      relacionadas: data.relacionadas || [],
      url_commit: `https://github.com/${REPO}/commit/${sha}`,
      url_file: `https://github.com/${REPO}/blob/${sha}/${filePath}`,
      url_raw: `https://raw.githubusercontent.com/${REPO}/${sha}/${filePath}`,
      changes: [],
    });
  }

  versions.forEach((version, index) => {
    const older = versions[index + 1];
    if (!older) {
      version.changes.push('Primera versión registrada');
      return;
    }
    version.url_compare = `https://github.com/${REPO}/compare/${older.sha}...${version.sha}`;
    if (String(older.title ?? '') !== String(version.title ?? '')) version.changes.push('Título modificado');
    if (String(older.question ?? '') !== String(version.question ?? '')) version.changes.push('Pregunta inicial modificada');
    if (String(older.summary ?? '') !== String(version.summary ?? '')) version.changes.push('Resumen modificado');
    if (String(older.status ?? '') !== String(version.status ?? '')) {
      version.changes.push(`Estado: ${older.status} → ${version.status}`);
    }

    const addedNodos = version.nodos.filter((nodo) => !older.nodos.includes(nodo));
    const removedNodos = older.nodos.filter((nodo) => !version.nodos.includes(nodo));
    if (addedNodos.length) version.changes.push(`Nodos añadidos: ${addedNodos.join(' · ')}`);
    if (removedNodos.length) version.changes.push(`Nodos retirados: ${removedNodos.join(' · ')}`);

    const currentCorpus = corpusUrls(version.corpus);
    const olderCorpus = corpusUrls(older.corpus);
    const addedCorpus = currentCorpus.filter((url) => !olderCorpus.includes(url));
    const removedCorpus = olderCorpus.filter((url) => !currentCorpus.includes(url));
    if (addedCorpus.length) version.changes.push(`Corpus añadido: ${addedCorpus.length}`);
    if (removedCorpus.length) version.changes.push(`Corpus retirado: ${removedCorpus.length}`);

    const addedRelations = version.relacionadas.filter((url) => !older.relacionadas.includes(url));
    const removedRelations = older.relacionadas.filter((url) => !version.relacionadas.includes(url));
    if (addedRelations.length) version.changes.push(`Relaciones añadidas: ${addedRelations.length}`);
    if (removedRelations.length) version.changes.push(`Relaciones retiradas: ${removedRelations.length}`);
  });

  return versions;
}

export function currentVersion(doc: Doc<ExploracionData>) {
  return {
    title: doc.data.title,
    question: doc.data.question,
    summary: doc.data.summary,
    status: doc.data.status,
    nodos: doc.data.nodos || [],
    corpus: doc.data.corpus || [],
    relacionadas: doc.data.relacionadas || [],
    updated: dateString(doc.data.updated),
  };
}

export function historyFileFor(slug: string): string {
  const file = path.join('src', 'content', 'exploraciones', `${slug}.md`);
  return fs.existsSync(path.join(ROOT, file)) ? file : '';
}
