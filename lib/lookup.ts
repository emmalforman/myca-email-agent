import type { LookupResult } from '@/types';

export async function lookupPerson(role: string, company: string): Promise<LookupResult[]> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY!;
  const cseId = process.env.GOOGLE_CSE_ID!;

  // Build search query
  const query = `"${company}" ("${role}" OR "VP ${role}" OR "Director of ${role}" OR "${role} Marketing" OR "Head of ${role}") site:linkedin.com`;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=5`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      // Fallback: search without LinkedIn restriction
      const fallbackUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(`"${company}" "${role}"`)}&num=5`;
      const fallbackResponse = await fetch(fallbackUrl);
      const fallbackData = await fallbackResponse.json();
      
      return parseSearchResults(fallbackData.items || [], company);
    }

    return parseSearchResults(data.items, company);
  } catch (error) {
    console.error('Lookup error:', error);
    return [];
  }
}

function parseSearchResults(items: any[], company: string): LookupResult[] {
  return items.slice(0, 5).map((item) => {
    // Extract name and title from snippet/title
    const title = item.title || '';
    const snippet = item.snippet || '';
    
    // Try to extract name (usually first part before - or |)
    const nameMatch = title.match(/^([^-|]+)/);
    const name = nameMatch ? nameMatch[1].trim() : 'Unknown';
    
    // Try to extract title
    const titleMatch = snippet.match(/(VP|Director|Head|Manager|Lead|Chief).*?(?:at|@)/i) || 
                      title.match(/(VP|Director|Head|Manager|Lead|Chief).*?(?:at|@)/i);
    const extractedTitle = titleMatch ? titleMatch[0].replace(/at|@/i, '').trim() : snippet.split('at')[0]?.trim() || 'Unknown Title';

    return {
      name,
      title: extractedTitle,
      company,
      source: item.link || '',
    };
  });
}


