import { listExploraciones, listNodos, allAnexos, exploracionSlugFromUrl } from '../lib/content';
import { loadAnexoTipos } from '../lib/data';
import { withBase } from '../lib/site';

export function GET() {
  const exploraciones = listExploraciones().map((doc) => ({
    order: doc.data.order,
    title: doc.data.title,
    url: withBase(`/${doc.slug}/`),
    nodos: doc.data.nodos?.length ?? 0,
    corpus: doc.data.corpus?.length ?? 0,
  }));

  const nodosList = listNodos().map((doc) => ({
    title: doc.data.title,
    definition: doc.data.definition ?? '',
    url: withBase(`/nodos/#${doc.slug}`),
  }));

  const tipos = loadAnexoTipos();
  const anexos = allAnexos().map((anexo) => {
    const parentSlug = exploracionSlugFromUrl(anexo.data.exploracion as string | undefined);
    const tipo = tipos.find((item) => item.id === anexo.data.tipo);
    return {
      title: anexo.data.title,
      tipo: tipo?.label ?? 'Anexo',
      exploracion: parentSlug ?? '',
      url: parentSlug ? withBase(`/${parentSlug}/anexos/${anexo.slug}/`) : withBase('/aparato/'),
    };
  });

  return new Response(JSON.stringify({ nodos: nodosList.length, exploraciones, nodosList, anexos }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
