// Note: Substack doesn't have a public API for creating posts
// We generate content with Claude and provide copy-to-clipboard functionality

export interface SubstackDraft {
  title: string;
  body: string;
  subtitle?: string;
  tags?: string[];
}

