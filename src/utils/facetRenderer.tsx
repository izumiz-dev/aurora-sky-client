interface Facet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: Array<{
    $type: string;
    uri?: string;
    did?: string;
  }>;
}

export function renderTextWithFacets(text: string, facets?: Facet[]) {
  if (!facets || facets.length === 0) {
    return <span>{text}</span>;
  }

  // Sort facets by byte start position
  const sortedFacets = [...facets].sort((a, b) => a.index.byteStart - b.index.byteStart);
  
  const elements: preact.JSX.Element[] = [];
  let lastIndex = 0;
  
  // Convert string to bytes for proper indexing
  const encoder = new TextEncoder();
  const textBytes = encoder.encode(text);
  
  sortedFacets.forEach((facet, i) => {
    const { byteStart, byteEnd } = facet.index;
    
    // Add text before this facet
    if (byteStart > lastIndex) {
      const beforeBytes = textBytes.slice(lastIndex, byteStart);
      const beforeText = new TextDecoder().decode(beforeBytes);
      elements.push(<span key={`text-${i}`}>{beforeText}</span>);
    }
    
    // Get the facet text
    const facetBytes = textBytes.slice(byteStart, byteEnd);
    const facetText = new TextDecoder().decode(facetBytes);
    
    // Render the facet based on its type
    const feature = facet.features[0];
    if (feature.$type === 'app.bsky.richtext.facet#link' && feature.uri) {
      elements.push(
        <a 
          key={`link-${i}`}
          href={feature.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {facetText}
        </a>
      );
    } else if (feature.$type === 'app.bsky.richtext.facet#mention' && feature.did) {
      elements.push(
        <a 
          key={`mention-${i}`}
          href={`https://bsky.app/profile/${feature.did}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {facetText}
        </a>
      );
    } else {
      elements.push(<span key={`facet-${i}`}>{facetText}</span>);
    }
    
    lastIndex = byteEnd;
  });
  
  // Add remaining text
  if (lastIndex < textBytes.length) {
    const remainingBytes = textBytes.slice(lastIndex);
    const remainingText = new TextDecoder().decode(remainingBytes);
    elements.push(<span key="text-final">{remainingText}</span>);
  }
  
  return <>{elements}</>;
}