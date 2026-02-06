// Basic Synonym Database (Proof of Concept)
// In a real scenario, this would use a large JSON or an AI model API
const synonyms: Record<string, string[]> = {
  vital: ['essential', 'crucial', 'fundamental', 'imperative'],
  improve: ['enhance', 'boost', 'refine', 'better'],
  helpful: ['beneficial', 'useful', 'advantageous', 'valuable'],
  smart: ['intelligent', 'clever', 'shrewd', 'astute'],
  fast: ['quick', 'rapid', 'swift', 'speedy'],
  increase: ['expand', 'grow', 'escalate', 'augment'],
  tool: ['software', 'application', 'platform', 'system'],
  method: ['strategy', 'approach', 'technique', 'process'],
  best: ['top', 'finest', 'ultimate', 'premier'],
  global: ['worldwide', 'international', 'universal', 'comprehensive'],
  simple: ['easy', 'straightforward', 'uncomplicated', 'effortless'],
  effective: ['efficient', 'productive', 'successful', 'potent'],
  future: ['perspective', 'outlook', 'potential', 'forthcoming'],
  quality: ['standard', 'excellence', 'caliber', 'grade'],
};

/**
 * Basic article spinner using a synonym dictionary.
 * For production, this would integrate with an LLM like Gemini or GPT.
 */
export function spinText(text: string): string {
  if (!text) return '';

  const words = text.split(/\b/);
  const spunWords = words.map((word) => {
    const lowerWord = word.toLowerCase();
    if (synonyms[lowerWord]) {
      const choices = synonyms[lowerWord];
      // Keep casing roughly correct
      const choice = choices[Math.floor(Math.random() * choices.length)];
      return charMatchCase(word, choice);
    }
    return word;
  });

  return spunWords.join('');
}

function charMatchCase(source: string, target: string): string {
  if (!source[0]) return target;
  if (source.startsWith(source[0].toUpperCase())) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

/**
 * Generates an SEO-optimized HTML content wrapper.
 */
export function formatForWordPress(title: string, content: string, keywords: string): string {
  const kwList = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  // Basic SEO Insertion
  let html = `<p><em>Keywords: ${kwList.join(', ')}</em></p>\n\n`;
  html += content
    .split('\n')
    .map((p) => (p.trim() ? `<p>${p}</p>` : ''))
    .join('\n');

  return html;
}
