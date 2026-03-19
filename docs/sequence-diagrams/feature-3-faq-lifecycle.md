# FAQ lifecycle

This diagram combines the main FAQ flows into one high-level view: browsing FAQs, creating or updating an FAQ, and removing an FAQ.

```mermaid
sequenceDiagram
    participant User
    participant faqView as ":FAQView"
    participant faqHandler as ":FAQHandler"
    participant faqRepository as ":FAQRepository"

    %% Flow 1 - Browse FAQs
    User->>+faqView: Open FAQ page
    faqView->>+faqHandler: Request FAQs
    faqHandler->>+faqRepository: Load FAQs and tags
    faqRepository-->>-faqHandler: FAQ list
    faqHandler-->>-faqView: Return FAQs
    faqView-->>-User: Show FAQ list

    %% Flow 2 - Create or update an FAQ
    User->>+faqView: Create or edit an FAQ
    faqView->>+faqHandler: Submit FAQ details and tags
    faqHandler->>+faqRepository: Save FAQ and tags
    faqRepository-->>-faqHandler: Saved FAQ
    faqHandler-->>-faqView: Return FAQ
    faqView-->>-User: Show updated FAQ list

    %% Flow 3 - Remove an FAQ
    User->>+faqView: Delete an FAQ
    faqView->>+faqHandler: Remove FAQ
    faqHandler->>+faqRepository: Delete FAQ and tags
    faqRepository-->>-faqHandler: FAQ removed
    faqHandler-->>-faqView: Return removal result
    faqView-->>-User: Update FAQ list
```

## Covered flows

| Flow | What it shows |
|------|---------------|
| Browse FAQs | The user opens the FAQ page and reviews the list of FAQs with categories and tags. |
| Create or update an FAQ | The user adds a new FAQ or edits an existing one, and the system saves the question, answer, category, and tags. |
| Remove an FAQ | The user deletes an FAQ and the list reflects the change. |
