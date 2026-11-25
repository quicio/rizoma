import { slugify } from './content';

export interface CartographyNode {
  id: string;
  title: string;
  definition?: string;
  order?: string;
  exploraciones: string[];
  shared: boolean;
  x: number;
  y: number;
  r: number;
  label?: boolean;
  active?: boolean;
  autoPlaced?: boolean;
}

export interface CartographyEdge {
  from: string;
  to: string;
  kind: 'shared' | 'unique' | 'ring';
  path: string;
}

export interface Cartography {
  nodes: CartographyNode[];
  edges: CartographyEdge[];
  width: number;
  height: number;
  counts: {
    nodos: number;
    exploraciones: number;
    shared: number;
  };
}

interface ExplorationLike {
  slug: string;
  data: { title: string; order?: string | number; nodos?: string[] };
}

interface NodoLike {
  slug: string;
  data: { title: string; order?: string; definition?: string };
}

type Position = { x: number; y: number; r?: number; label?: boolean; active?: boolean };

const POSITIONS: Record<string, Position> = {
  repeticion: { x: 500, y: 300, r: 10, label: true, active: true },
  memoria: { x: 575, y: 385, r: 8.5, label: true },
  archivo: { x: 430, y: 405, r: 8.5, label: true },
  automatizacion: { x: 506, y: 205, r: 7.5, label: true },
  redundancia: { x: 404, y: 292, r: 7.5, label: true },
  persistencia: { x: 250, y: 195, r: 5.5, label: true },
  desgaste: { x: 205, y: 455, r: 5, label: false },
  recurrencia: { x: 330, y: 120, r: 5, label: false },
  diferencia: { x: 300, y: 540, r: 5, label: true },
  olvido: { x: 700, y: 175, r: 5, label: false },
  soporte: { x: 720, y: 470, r: 5, label: true },
  residuo: { x: 805, y: 555, r: 5.5, label: true },
  'exp-01': { x: 320, y: 350, r: 17 },
  'exp-02': { x: 780, y: 350, r: 17 },
};

const MAP_CENTER = { x: 500, y: 340 };
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const warnedFallbacks = new Set<string>();

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Posición de reserva para un nodo sin coordenada curada. Usa una espiral
 * determinista y evita los nodos ya ubicados. No es una composición: es una
 * red de seguridad para que ningún nodo desaparezca del mapa.
 */
function fallbackPosition(index: number, occupied: { x: number; y: number }[]): Position {
  for (let attempt = 0; attempt < 220; attempt += 1) {
    const angle = index * GOLDEN_ANGLE + attempt * (GOLDEN_ANGLE / 3);
    const ring = 265 + Math.floor(attempt / 16) * 34;
    const x = MAP_CENTER.x + Math.cos(angle) * ring;
    const y = MAP_CENTER.y + Math.sin(angle) * ring * 0.82;
    if (x < 60 || x > 940 || y < 45 || y > 635) continue;
    if (occupied.every((point) => distance(point, { x, y }) > 44)) {
      return { x: Math.round(x), y: Math.round(y), r: 5.5, label: false };
    }
  }
  return {
    x: 60 + (index % 12) * 74,
    y: 70 + (Math.floor(index / 12) % 7) * 78,
    r: 5.5,
    label: false,
  };
}

function curve(a: CartographyNode, b: CartographyNode, index: number): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
  const bend = (index % 2 === 0 ? 1 : -1) * Math.min(58, length * 0.22);
  const cx = mx - (dy / length) * bend;
  const cy = my + (dx / length) * bend;
  return `M ${a.x} ${a.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x} ${b.y}`;
}

/**
 * Construye una constelación determinista a partir de los nodos reales.
 * No inventa relaciones: cada arista corresponde a una exploración que usa
 * el nodo, o a la convivencia de dos nodos compartidos en el mismo cuerpo.
 */
export function buildCartography(
  exploraciones: ExplorationLike[],
  nodos: NodoLike[],
  options: { includeAnchors?: boolean } = {}
): Cartography {
  const includeAnchors = options.includeAnchors ?? true;
  const usage = new Map<string, string[]>();

  for (const exploracion of exploraciones) {
    for (const title of exploracion.data.nodos || []) {
      const list = usage.get(title) || [];
      list.push(exploracion.slug);
      usage.set(title, list);
    }
  }

  const nodes: CartographyNode[] = [];

  if (includeAnchors) {
    for (const [index, exploracion] of exploraciones.entries()) {
      const key = `exp-0${index + 1}`;
      const occupied = nodes.map((node) => ({ x: node.x, y: node.y }));
      const pos = POSITIONS[key] || fallbackPosition(index * 3 + 1, occupied);
      nodes.push({
        id: key,
        title: exploracion.data.title,
        order: String(exploracion.data.order ?? index + 1).padStart(2, '0'),
        exploraciones: [exploracion.slug],
        shared: false,
        x: pos.x,
        y: pos.y,
        r: pos.r ?? 17,
      });
    }
  }

  const occupied = nodes.map((node) => ({ x: node.x, y: node.y }));
  const fallbackPositions = new Map<string, Position>();
  const missing: string[] = [];

  for (const [index, nodo] of nodos.entries()) {
    const key = slugify(nodo.data.title);
    if (POSITIONS[key]) continue;
    const pos = fallbackPosition(index + nodes.length, occupied);
    fallbackPositions.set(key, pos);
    occupied.push({ x: pos.x, y: pos.y });
    missing.push(nodo.data.title);
  }

  if (missing.length > 0) {
    const fresh = missing.filter((title) => !warnedFallbacks.has(title));
    if (fresh.length > 0) {
      fresh.forEach((title) => warnedFallbacks.add(title));
      console.warn(
        `[cartography] ${fresh.length} nodo(s) sin posición curada: ${fresh.join(', ')}. ` +
          'Se ubicaron automáticamente. Agregá su coordenada en POSITIONS para controlar la composición.'
      );
    }
  }

  for (const nodo of nodos) {
    const key = slugify(nodo.data.title);
    const curated = POSITIONS[key];
    const pos = curated || fallbackPositions.get(key);
    if (!pos) continue;
    const linked = usage.get(nodo.data.title) || [];
    nodes.push({
      id: key,
      title: nodo.data.title,
      definition: nodo.data.definition,
      order: nodo.data.order,
      exploraciones: linked,
      shared: linked.length > 1,
      x: pos.x,
      y: pos.y,
      r: pos.r ?? 5,
      label: pos.label ?? linked.length > 1,
      active: pos.active ?? false,
      autoPlaced: !curated,
    });
  }

  const edges: CartographyEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (a: CartographyNode, b: CartographyNode, kind: CartographyEdge['kind']) => {
    const key = [a.id, b.id].sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from: a.id, to: b.id, kind, path: curve(a, b, edges.length) });
  };

  if (includeAnchors) {
    for (const anchor of nodes.filter((node) => node.id.startsWith('exp-'))) {
      for (const node of nodes.filter((item) => !item.id.startsWith('exp-'))) {
        if (node.exploraciones.includes(anchor.exploraciones[0])) addEdge(anchor, node, 'unique');
      }
    }
  }

  const shared = nodes.filter((node) => node.shared);
  for (let i = 0; i < shared.length; i += 1) {
    for (let j = i + 1; j < shared.length; j += 1) {
      if (shared[i].exploraciones.join() === shared[j].exploraciones.join()) {
        addEdge(shared[i], shared[j], 'ring');
      }
    }
  }

  return {
    nodes,
    edges,
    width: 1000,
    height: 680,
    counts: {
      nodos: nodos.length,
      exploraciones: exploraciones.length,
      shared: nodes.filter((node) => node.shared).length,
    },
  };
}
