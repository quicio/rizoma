import { listExploraciones, listNodos } from '../lib/content';
import { withBase } from '../lib/site';

export function GET() {
  const exploraciones = listExploraciones().map((doc) => ({
    order: doc.data.order,
    title: doc.data.title,
    url: withBase(`/${doc.slug}/`),
    nodos: doc.data.nodos?.length ?? 0,
    corpus: doc.data.corpus?.length ?? 0,
  }));

  return new Response(
    JSON.stringify({ nodos: listNodos().length, exploraciones }, null, 2),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}
