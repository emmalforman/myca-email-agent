import { Client } from '@notionhq/client';
import type { DraftResponse, LookupResult } from '@/types';

const notion = process.env.NOTION_API_KEY
  ? new Client({ auth: process.env.NOTION_API_KEY })
  : null;

export async function logEmailToNotion(
  originalInput: string,
  draft: DraftResponse,
  selectedPerson?: LookupResult | null,
  questions?: string[],
  answers?: Record<number, string>
) {
  if (!notion || !process.env.NOTION_DATABASE_ID) {
    return null; // Notion not configured, silently skip
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        // Title property (must match your Notion database)
        Name: {
          title: [
            {
              text: {
                content: draft.subject || 'Email Draft',
              },
            },
          ],
        },
        // Status property
        Status: {
          select: {
            name: 'Draft',
          },
        },
        // Mode property
        Mode: {
          select: {
            name: draft.mode,
          },
        },
        // Tag property
        Tag: {
          select: {
            name: draft.tag,
          },
        },
        // Recipient property
        Recipient: {
          rich_text: [
            {
              text: {
                content: draft.to,
              },
            },
          ],
        },
        // Date property
        Date: {
          date: {
            start: new Date().toISOString(),
          },
        },
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Original Request',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: originalInput,
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                text: {
                  content: 'Email Draft',
                },
              },
            ],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                text: {
                  content: `To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`,
                },
              },
            ],
          },
        },
        ...(selectedPerson
          ? [
              {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                  rich_text: [
                    {
                      text: {
                        content: 'Selected Person',
                      },
                    },
                  ],
                },
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [
                    {
                      text: {
                        content: `${selectedPerson.name} - ${selectedPerson.title} at ${selectedPerson.company}`,
                      },
                    },
                  ],
                },
              },
            ]
          : []),
        ...(questions && questions.length > 0
          ? [
              {
                object: 'block',
                type: 'heading_2',
                heading_2: {
                  rich_text: [
                    {
                      text: {
                        content: 'Questions Asked',
                      },
                    },
                  ],
                },
              },
              ...questions.map((q, idx) => ({
                object: 'block' as const,
                type: 'bulleted_list_item' as const,
                bulleted_list_item: {
                  rich_text: [
                    {
                      text: {
                        content: `${q}${answers?.[idx] ? ` → ${answers[idx]}` : ''}`,
                      },
                    },
                  ],
                },
              })),
            ]
          : []),
      ],
    });

    return response.id;
  } catch (error) {
    console.error('Notion logging error:', error);
    // Don't throw - logging is optional
    return null;
  }
}

