// Kabla: admin anaandika habari kwenye <textarea> ya kawaida (maandishi
// tupu), lakini article page ilikuwa inaonyesha content kama HTML halisi
// (dangerouslySetInnerHTML) moja kwa moja -- matokeo: hakuna aya (paragraphs)
// zinazopangika, na kama admin akiandika "<" popote (bila kukusudia),
// ingeweza kuvunja HTML au kuonekana vibaya.
//
// Function hii: (1) inasafisha (escape) HTML yoyote ya bahati mbaya
// kwenye maandishi ya admin, (2) inabadilisha mistari-miwili-mfululizo
// (paragraph break ya kawaida anapoacha nafasi) kuwa <p> tags, (3)
// mstari mmoja ndani ya aya inakuwa <br>. Matokeo: admin anaandika
// maandishi ya kawaida tu, article inaonekana vizuri ikitumia .prose-school
// styling (h2/h3/blockquote bado zinaweza kuandikwa kama HTML halisi kama
// admin anajua kuandika, lakini si lazima).
export function formatArticleContent(raw: string): string {
  if (!raw) return '';

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // Kama maandishi tayari yana HTML tags za kawaida za makala (h2, p, ul, n.k),
  // tunaamini admin ameandika HTML kwa makusudi -- hatuubadilishi (haturuhusu
  // escape kuvunja muundo aliouandaa mwenyewe).
  const looksLikeHtml = /<(p|h[1-6]|ul|ol|li|blockquote|strong|em|br)[\s>]/i.test(raw);
  if (looksLikeHtml) return raw;

  const paragraphs = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`);

  return paragraphs.join('\n');
}
