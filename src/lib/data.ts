import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { dateString, sectionMap, type Doc, type ExploracionData } from './content';

const ROOT = process.cwd();

export function loadYaml<T = any>(relative: string): T | undefined {
  const file = path.join(ROOT, relative);
  if (!fs.existsSync(file)) return undefined;
  return yaml.load(fs.readFileSync(file, 'utf8')) as T;
}

export function loadYamlDir<T = any>(relative: string): T[] {
  const dir = path.join(ROOT, relative);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(yml|yaml)$/.test(name))
    .sort()
    .map((name) => yaml.load(fs.readFileSync(path.join(dir, name), 'utf8')) as T)
    .filter(Boolean);
}

export interface Material {
  url: string;
  title: string;
  kind: string;
  sigil?: string;
  glyph?: string;
}

let materialCache: Map<string, Material> | undefined;

function materialMap(): Map<string, Material> {
  if (materialCache) return materialCache;
  const list = loadYaml<Material[]>('src/data/kndl-materiales.yml') || [];
  materialCache = new Map(list.map((item) => [item.url, item]));
  return materialCache;
}

export function materialFor(url: string): Material {
  const found = materialMap().get(url);
  if (found) return found;
  if (url === '/fragmentos/') {
    return { url, title: 'Rastros', kind: 'Rastro', sigil: 'rastros', glyph: '⟡' };
  }
  const prefixes: [string, string, string, string][] = [
    ['/poemas/', 'Poema', 'poemas', '⁂'],
    ['/codigo/', 'Código', 'codigo', '◊'],
    ['/dispositivos/', 'Dispositivo', 'dispositivos', '⎔'],
    ['/vestigios/', 'Vestigio', 'vestigios', '⏚'],
    ['/imaginario/', 'Imagen', 'imaginario', '◉'],
    ['/melange-reports/', 'Melange', 'melange', '🜏'],
  ];
  const match = prefixes.find(([prefix]) => url.startsWith(prefix));
  if (match) return { url, title: url, kind: match[1], sigil: match[2], glyph: match[3] };
  return { url, title: url, kind: 'Material' };
}

export function loadAnexoTipos() {
  return loadYaml<{ id: string; label: string; order: number; question: string }[]>(
    'src/data/anexos_tipos.yml'
  ) || [];
}

export interface NavItem {
  name: string;
  url: string;
  glyph: string;
  sigil: string;
  description?: string;
  primary?: boolean;
  featured?: boolean;
  detail_prefixes?: string[];
}

export function loadNavigation(): NavItem[] {
  return loadYaml<NavItem[]>('src/data/navigation.yml') || [];
}

export interface Presentacion {
  mapa: { id: string; etiqueta: string; movimiento?: string }[];
  respiros: Record<string, { texto: string; fuente: string; fuente_titulo: string }[]>;
  diagrama?: {
    tipo: string;
    titulo: string;
    antes_de?: string;
    izquierda: { etiqueta: string; nota: string; obras: Material[] };
    derecha: { etiqueta: string; nota: string; obras: Material[] };
    corte: string;
    blanco: string;
  };
  aparato_abierto: boolean;
}

function displayTitle(title: string): string {
  return title.replace(/^\d+[.)]\s*/, '');
}

export function buildPresentacion(doc: Doc<ExploracionData>): Presentacion {
  const config = loadYaml<any>(`src/data/presentaciones/${doc.slug}.yml`) || {};
  const sections = sectionMap(doc.body);
  const byId = new Map(sections.map((section) => [section.id, section]));

  let mapa: Presentacion['mapa'];
  if (Array.isArray(config.mapa) && config.mapa.length > 0) {
    mapa = config.mapa
      .filter((item: any) => item && typeof item === 'object')
      .map((item: any) => {
        const id = String(item.seccion ?? '');
        const section = byId.get(id);
        if (!section) throw new Error(`Rizoma presentación: mapa con sección inexistente: ${id}`);
        return {
          id,
          etiqueta: item.etiqueta || displayTitle(section.titulo),
          movimiento: item.movimiento,
        };
      });
  } else {
    mapa = sections.map((section) => ({
      id: section.id,
      etiqueta: displayTitle(section.titulo),
    }));
  }

  const corpus = (doc.data.corpus || []).map((item) => item.url);
  const respiros: Presentacion['respiros'] = {};
  if (Array.isArray(config.respiros)) {
    for (const item of config.respiros) {
      if (!item || typeof item !== 'object') continue;
      const before = String(item.antes_de ?? '');
      const texto = String(item.texto ?? '');
      const fuente = String(item.fuente ?? '');
      if (!before) throw new Error('Rizoma presentación: respiro sin antes_de');
      if (!byId.has(before)) throw new Error(`Rizoma presentación: respiro con sección inexistente: ${before}`);
      if (!texto) throw new Error('Rizoma presentación: respiro sin texto');
      if (!fuente) throw new Error('Rizoma presentación: respiro sin fuente');
      if (!corpus.includes(fuente)) throw new Error(`Rizoma presentación: respiro con fuente fuera del corpus: ${fuente}`);
      (respiros[before] ||= []).push({
        texto,
        fuente,
        fuente_titulo: materialFor(fuente).title,
      });
    }
  }

  let diagrama: Presentacion['diagrama'];
  if (config.diagrama && typeof config.diagrama === 'object') {
    const type = String(config.diagrama.tipo || 'regimenes');
    if (type !== 'regimenes') throw new Error(`Rizoma presentación: tipo de diagrama no soportado: ${type}`);
    const side = (value: any, label: string) => {
      if (!value || typeof value !== 'object') throw new Error(`Rizoma presentación: falta ${label}`);
      const obras = (Array.isArray(value.obras) ? value.obras : []).map((url: string) => {
        if (!corpus.includes(url)) throw new Error(`Rizoma presentación: obra fuera del corpus: ${url}`);
        return materialFor(url);
      });
      if (obras.length === 0) throw new Error(`Rizoma presentación: ${label} sin obras`);
      return { etiqueta: String(value.etiqueta ?? ''), nota: String(value.nota ?? ''), obras };
    };
    const antesDe = String(config.diagrama.antes_de ?? '');
    if (antesDe && !byId.has(antesDe)) {
      throw new Error(`Rizoma presentación: diagrama con sección inexistente: ${antesDe}`);
    }
    diagrama = {
      tipo: type,
      titulo: String(config.diagrama.titulo ?? ''),
      antes_de: antesDe || undefined,
      izquierda: side(config.diagrama.izquierda, 'izquierda'),
      derecha: side(config.diagrama.derecha, 'derecha'),
      corte: String(config.diagrama.corte ?? ''),
      blanco: String(config.diagrama.blanco ?? ''),
    };
  }

  return {
    mapa,
    respiros,
    diagrama,
    aparato_abierto: String(config.aparato ?? '').toLowerCase() === 'abierto',
  };
}

/* -------------------------------------------------------------------------
 * Trama, composiciones y trayectoria (piloto B3.1.1)
 * ---------------------------------------------------------------------- */

export interface Composición {
  id: string;
  exploracion: string;
  frentes?: { id: string; etiqueta?: string; ancla?: string; orden?: number }[];
  inscripciones?: { id: string; etiqueta?: string; ancla?: string; orden?: number }[];
}

export function loadComposiciones(): Composición[] {
  const docs = loadYamlDir<Composición>('src/data/composiciones');
  return docs.map((doc) => ({ ...doc, id: doc.id }));
}

export function loadTrama() {
  const files = loadYamlDir<any>('docs/trama');
  const merged = { frentes: [] as any[], inscripciones: [] as any[] };
  for (const data of files) {
    merged.frentes.push(...(Array.isArray(data.frentes) ? data.frentes : []));
    merged.inscripciones.push(...(Array.isArray(data.inscripciones) ? data.inscripciones : []));
  }
  return merged;
}

export function loadCartografias() {
  return loadYamlDir<any>('docs/cartografias').filter((item) => item.publicar !== false);
}

function stateLabel(value: unknown): string {
  const labels: Record<string, string> = {
    abierto: 'abierto',
    'en-tension': 'en tensión',
    resuelto: 'resuelto',
    latente: 'latente',
    cortado: 'cortado',
    derivado: 'derivado',
  };
  return labels[String(value ?? '')] ?? String(value ?? '');
}

export interface Trayectoria {
  frentes: {
    id: string;
    nombre_canonico: string;
    estado?: string;
    estado_label?: string;
  }[];
  cartografia?: { id: string; fecha: string; decision: string; url: string };
}

export function buildTrayectoria(doc: Doc<ExploracionData>): Trayectoria | undefined {
  const compositions = loadComposiciones();
  const composition = compositions.find(
    (item) => path.basename(item.exploracion ?? '', path.extname(item.exploracion ?? '')) === doc.slug
  );
  if (!composition) return undefined;

  const trama = loadTrama();
  const frentes = (composition.frentes || []).map((selection) => {
    const front = trama.frentes.find((item) => item.id === selection.id);
    if (!front) throw new Error(`Rizoma trayectoria: frente inexistente: ${selection.id}`);
    return {
      id: front.id,
      nombre_canonico: front.nombre_canonico || front.id,
      estado: front.estado,
      estado_label: stateLabel(front.estado),
    };
  });

  const cartographies = loadCartografias().filter((item) =>
    Array.isArray(item?.alcance?.composiciones) && item.alcance.composiciones.includes(composition.id)
  );
  const latest = cartographies.sort((a, b) => String(a.fecha).localeCompare(String(b.fecha))).at(-1);

  return {
    frentes,
    cartografia: latest
      ? {
          id: latest.id,
          fecha: String(latest.fecha),
          decision: String(latest.decision ?? ''),
          url: `/rizoma/trayectoria/${latest.id}/`,
        }
      : undefined,
  };
}

export function buildCartografia(cartography: any) {
  const trama = loadTrama();
  const compositions = loadComposiciones();

  const resolveFront = (id: string | undefined) => {
    const front = trama.frentes.find((item) => item.id === id);
    if (!front) return null;
    return {
      id: front.id,
      nombre: front.nombre_canonico || front.id,
      estado: front.estado,
      estado_label: stateLabel(front.estado),
      formulaciones: (front.formulaciones || []).map((item: any) => ({
        ...item,
        fecha: dateString(item.fecha),
      })),
      tensiones: front.tensiones || [],
    };
  };

  const resolveComposition = (id: string) => {
    const composition = compositions.find((item) => item.id === id);
    if (!composition) return { id, titulo: id, url: '/' };
    const slug = path.basename(composition.exploracion ?? '', path.extname(composition.exploracion ?? ''));
    return { id, titulo: slug, url: `/rizoma/${slug}/`, slug };
  };

  const resolveInscription = (id: string) => {
    const inscription = trama.inscripciones.find((item: any) => item.id === id);
    if (!inscription) return null;
    return {
      id: inscription.id,
      material: materialFor(inscription.material),
      frente: resolveFront(inscription.frente),
      interpretacion: inscription.interpretacion,
      evidencia: inscription.evidencia || [],
      estado: inscription.estado,
    };
  };

  return {
    id: cartography.id,
    fecha: String(cartography.fecha),
    autor: cartography.autor,
    propuesta_por: cartography.propuesta_por,
    decision: cartography.decision,
    notas: cartography.notas,
    frente: resolveFront(cartography?.alcance?.frente),
    composiciones: (cartography?.alcance?.composiciones || []).map(resolveComposition),
    aceptadas: (cartography.aceptadas || []).map(resolveInscription).filter(Boolean),
    rechazadas: cartography.rechazadas || [],
    pendientes: cartography.pendientes || [],
    evidencia: cartography.evidencia || [],
  };
}
