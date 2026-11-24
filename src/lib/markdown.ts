import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import { rewriteLinks } from './site';

const md = new MarkdownIt({
  html: true,
  linkify: false,
  breaks: false,
  typographer: false,
}).use(attrs);

/** Renderiza markdown con soporte para {#ancla} y HTML crudo. */
export function renderMarkdown(body: string): string {
  return rewriteLinks(md.render(body));
}
