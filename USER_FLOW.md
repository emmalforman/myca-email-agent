# User Flow - Myca Email Agent

## Initial Setup (First Time Only)

```
1. Open app → Prompts for Gmail address
   ↓
2. Checks if Gmail is connected
   ↓
3a. If NOT connected → Shows "Connect Gmail" button
    ↓
    Click → Redirects to Google OAuth
    ↓
    Authorize → Returns to app → Connected!
   ↓
3b. If connected → Goes to main screen
```

## Main User Flow

### Flow 1: Simple Draft (You Have Name)

```
┌─────────────────────────────────────┐
│  IDLE STATE                          │
│  ┌───────────────────────────────┐  │
│  │ Text box:                     │  │
│  │ "Email Sarah Kim at Athletic  │  │
│  │  Brewing about joining Myca"  │  │
│  └───────────────────────────────┘  │
│  [Draft Email] button                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PROCESSING                            │
│  (Spinner: "Processing...")           │
│  Claude analyzes → Drafts email       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  DRAFT PREVIEW                      │
│  ┌───────────────────────────────┐ │
│  │ To: sarah.kim@athletic...     │ │
│  │ Subject: Invitation to Myca   │ │
│  │ Tag: BRAND                     │ │
│  │                                │ │
│  │ Body:                          │ │
│  │ [Full email preview]          │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Create Gmail Draft] [Mark Bad]   │
│  [Start Over]                       │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ SUCCESS      │  │ Back to IDLE│
│ ✓ Draft      │  │ (if Mark Bad│
│  created!    │  │  or Start   │
│              │  │  Over)      │
└──────────────┘  └──────────────┘
```

### Flow 2: Lookup Needed (Role Only)

```
┌─────────────────────────────────────┐
│  IDLE STATE                          │
│  "Email head of brand at Athletic   │
│   Brewing to invite into Myca"      │
│  [Draft Email]                       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PROCESSING                         │
│  Claude detects: role only          │
│  → Triggers lookup                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  LOOKUP (5 Candidates)              │
│  ┌───────────────────────────────┐ │
│  │ [1] John Smith                │ │
│  │     VP Brand at Athletic...   │ │
│  │                                │ │
│  │ [2] Sarah Kim                 │ │
│  │     Director of Brand...      │ │
│  │                                │ │
│  │ [3] Mark Lopez                │ │
│  │     Head of Marketing...       │ │
│  │                                │ │
│  │ [4] Emily Ross                │ │
│  │     Brand Manager...           │ │
│  │                                │ │
│  │ [5] Tom Evans                 │ │
│  │     CMO at Athletic...        │ │
│  └───────────────────────────────┘ │
└──────────────┬──────────────────────┘
               │
        User clicks [2]
               │
               ▼
┌─────────────────────────────────────┐
│  PROCESSING                         │
│  Claude drafts with selected person │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ QUESTIONS    │  │ DRAFT PREVIEW│
│ (if needed)  │  │ (if enough   │
│              │  │  info)       │
└──────────────┘  └──────────────┘
```

### Flow 3: Strategic Question Asked

```
┌─────────────────────────────────────┐
│  DRAFT PREVIEW or LOOKUP            │
│  (After selection)                  │
└──────────────┬──────────────────────┘
               │
        Claude needs clarification
               │
               ▼
┌─────────────────────────────────────┐
│  QUESTIONS                          │
│  ┌───────────────────────────────┐ │
│  │ "Is this tied to a specific    │ │
│  │  upcoming event or general     │ │
│  │  relationship building?"       │ │
│  │                                │ │
│  │ [Text input box]              │ │
│  └───────────────────────────────┘ │
│  [Continue] button                  │
└──────────────┬──────────────────────┘
               │
        User answers
               │
               ▼
┌─────────────────────────────────────┐
│  PROCESSING                         │
│  Claude drafts with answers         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  DRAFT PREVIEW                      │
│  (Now with full context)            │
└─────────────────────────────────────┘
```

## Complete Flow Diagram

```
                    START
                     │
                     ▼
            ┌────────────────┐
            │ Enter Gmail    │
            │ Address        │
            └────────┬───────┘
                     │
                     ▼
            ┌────────────────┐
            │ Gmail         │
            │ Connected?    │
            └───┬────────┬──┘
                │        │
         NO     │        │     YES
                │        │
                ▼        ▼
        ┌───────────┐  ┌──────────┐
        │ Connect   │  │   IDLE   │
        │ Gmail     │  │  Screen  │
        └─────┬─────┘  └────┬─────┘
              │             │
              │             │ User types request
              │             │
              └────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  PROCESSING   │
            │  (Claude)      │
            └────────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   LOOKUP      QUESTIONS    DRAFT PREVIEW
   (5 people)  (1-2 Qs)    (Email ready)
        │            │            │
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  DRAFT PREVIEW │
            │                │
            │  [Create Draft]│
            │  [Mark Bad]    │
            │  [Start Over]  │
            └────────┬───────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   SUCCESS      Back to IDLE  Back to IDLE
   (3 sec)      (Mark Bad)   (Start Over)
```

## State Transitions

| Current State | Action | Next State |
|--------------|--------|------------|
| `not_connected` | Click "Connect Gmail" | OAuth flow → `idle` |
| `idle` | Type + Click "Draft Email" | `processing` |
| `processing` | Claude returns lookup_needed | `lookup` |
| `processing` | Claude returns questions | `questions` |
| `processing` | Claude returns draft | `draft_preview` |
| `lookup` | Click person (1-5) | `processing` → `questions` or `draft_preview` |
| `questions` | Answer + Click "Continue" | `processing` → `draft_preview` |
| `draft_preview` | Click "Create Gmail Draft" | `processing` → `success` |
| `draft_preview` | Click "Mark as Bad" | `idle` (with feedback saved) |
| `draft_preview` | Click "Start Over" | `idle` |
| `success` | (Auto after 3 sec) | `idle` |

## Key Features

✅ **One text box** - Same input for all scenarios
✅ **Smart routing** - System decides: lookup, question, or draft
✅ **Optional steps** - Only shows lookup/questions when needed
✅ **Feedback loop** - "Mark as Bad" improves future drafts
✅ **Clean reset** - "Start Over" clears everything

## Example Flows

### Example 1: Fast Path (No Lookup, No Questions)
```
Type: "Email Sarah about joining Myca"
→ Processing (2 sec)
→ Draft Preview
→ Create Draft
→ Success!
Total: ~5 seconds
```

### Example 2: Full Path (Lookup + Question)
```
Type: "Email head of brand at Athletic Brewing"
→ Processing (2 sec)
→ Lookup: 5 candidates (pick #2)
→ Processing (2 sec)
→ Question: "Event or general?"
→ Answer: "Event"
→ Processing (2 sec)
→ Draft Preview
→ Create Draft
→ Success!
Total: ~15 seconds
```

### Example 3: Question Only
```
Type: "Email Priya about event"
→ Processing (2 sec)
→ Question: "Which event date?"
→ Answer: "Feb 2"
→ Processing (2 sec)
→ Draft Preview
→ Create Draft
→ Success!
Total: ~8 seconds
```



