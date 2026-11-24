import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { renderMarkdown } from './markdown';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'src', 'content');

export interface CorpusItem {
  url: string;
  note?: string;
  label?: string;
  kind?: string;
  sigil?: string;
}

export interface Hito {
  date?: string;
  title: string;
  text: string;
}

export interface AnexoRef {
  url: string;
  title: string;
  note?: string;
  tipo: string;
}

export interface ExploracionData {
  layout?: string;
  title: string;
  question?: string;
  summary?: string;
  order?: string | number;
  status?: string;
  date?: string;
  updated?: string;
  procedencia?: string;
  lamina?: boolean;
  fields?: string[];
  nodos?: string[];
  corpus?: CorpusItem[];
  corpus_secciones?: { seccion: string; piezas: string[] }[];
  relacionadas?: string[];
  anexos?: AnexoRef[];
  hitos?: Hito[];
  [key: string]: unknown;
}

export interface Doc<T> {
  slug: string;
  data: T;
  body: string;
  html: string;
}

function readDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

function readDoc<T>(file: string, slug: string): Doc<T> {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const data = parsed.data as T;
  return { slug, data, body: parsed.content, html: renderMarkdown(parsed.content) };
}

export function dateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function normalizeCorpus(value: unknown): CorpusItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (item && typeof item === 'object' && 'url' in item) {
        const record = item as Record<string, unknown>;
        return {
          url: String(record.url),
          note: record.note ? String(record.note) : undefined,
          label: record.label ? String(record.label) : undefined,
          kind: record.kind ? String(record.kind) : undefined,
          sigil: record.sigil ? String(record.sigil) : undefined,
        };
      }
      return null;
    })
    .filter(Boolean) as CorpusItem[];
}

export function listExploraciones(): Doc<ExploracionData>[] {
  const dir = path.join(CONTENT, 'exploraciones');
  return readDir(dir)
    .map((name) => {
      const doc = readDoc<ExploracionData>(path.join(dir, name), name.replace(/\.md$/, ''));
      doc.data.corpus = normalizeCorpus(doc.data.corpus);
      doc.data.date = dateString(doc.data.date);
      doc.data.updated = dateString(doc.data.updated);
      doc.data.hitos = (doc.data.hitos as Hito[] | undefined)?.map((hito) => ({
        ...hito,
        date: dateString(hito.date),
      }));
      return doc;
    })
    .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
}

export function getExploracion(slug: string): Doc<ExploracionData> | undefined {
  return listExploraciones().find((doc) => doc.slug === slug);
}

export function listNodos(): Doc<{ title: string; order?: string; definition?: string }>[] {
  const dir = path.join(CONTENT, 'nodos');
  return readDir(dir)
    .map((name) => readDoc<any>(path.join(dir, name), name.replace(/\.md$/, '')))
    .sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
}

export interface AnexoData {
  layout?: string;
  title: string;
  order?: string;
  tipo?: string;
  date?: string;
  estado?: string;
  exploracion?: string;
  procedencia?: string;
  permalink?: string;
  fuentes?: {
    autor?: string;
    titulo?: string;
    anio?: string | number;
    publicacion?: string;
    url?: string;
    consultado?: string;
    tipo?: string;
    verifica?: string;
  }[];
  [key: string]: unknown;
}

export interface AnexosBundle {
  exploracion: string;
  index?: Doc<AnexoData>;
  anexos: Doc<AnexoData>[];
}

export function listAnexos(exploracionSlug: string): AnexosBundle {
  const dir = path.join(CONTENT, 'anexos', exploracionSlug);
  const files = readDir(dir);
  let index: Doc<AnexoData> | undefined;
  const anexos: Doc<AnexoData>[] = [];

  for (const name of files) {
    const slug = name.replace(/\.md$/, '');
    const doc = readDoc<AnexoData>(path.join(dir, name), slug);
    doc.data.date = dateString(doc.data.date);
    if (slug === 'index') index = doc;
    else anexos.push(doc);
  }

  anexos.sort((a, b) => Number(a.data.order ?? 0) - Number(b.data.order ?? 0));
  return { exploracion: exploracionSlug, index, anexos };
}

export function allAnexos(): Doc<AnexoData>[] {
  const base = path.join(CONTENT, 'anexos');
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => listAnexos(entry.name).anexos);
}

export function exploracionSlugFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.match(/\/rizoma\/([^/]+)\/?$/);
  return match?.[1];
}

/** Extrae las secciones h2 del cuerpo, respetando bloques de código. */
export function sectionMap(body: string): { id: string; titulo: string }[] {
  const sections: { id: string; titulo: string }[] = [];
  const [intro] = body.split(/^##\s+/m);
  if (intro.trim()) sections.push({ id: 'introduccion', titulo: 'Introducción' });

  let inFence = false;
  for (const line of body.split('\n')) {
    if (line.startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const withId = line.match(/^##\s+(.+?)\s*\{#([^}]+)\}\s*$/);
    const plain = line.match(/^##\s+(.+?)\s*$/);
    if (withId) sections.push({ id: withId[2].trim(), titulo: withId[1].trim() });
    else if (plain) sections.push({ id: slugify(plain[1].trim()), titulo: plain[1].trim() });
  }
  return sections;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
