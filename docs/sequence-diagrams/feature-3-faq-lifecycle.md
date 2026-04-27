# FAQ access and catalogue maintenance

This diagram combines the main FAQ flows into one high-level view: browsing FAQs, creating or updating an FAQ, and removing an FAQ.

```mermaid
sequenceDiagram
    participant Student
    participant Counsellor
    participant faqView as ":FAQView"
    participant faqHandler as ":FAQHandler"
    participant faqRepository as ":FAQRepository"

    Student->>+faqView: Open FAQ page
    faqView->>+faqHandler: listFaqs()
    faqHandler->>+faqRepository: findAllFaqsWithTags()
    faqRepository-->>-faqHandler: FAQ list
    faqHandler-->>-faqView: Return FAQs
    faqView-->>-Student: Show FAQ list

    Counsellor->>+faqView: Open FAQ admin / edit catalogue
    faqView->>+faqHandler: createFaq(payload) or updateFaq(faqId, payload) or deleteFaq(faqId)
    faqHandler->>+faqRepository: saveFaqWithTags() or deleteFaq()
    faqRepository-->>-faqHandler: Updated or removed row(s)
    faqHandler-->>-faqView: Return result
    faqView-->>-Counsellor: Show updated admin view
```



## Covered flows


| Flow               | What it shows                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Browse FAQs        | `GET /api/faqs` via **listFaqs** / **findAllFaqsWithTags**.                               |
| Maintain catalogue | **createFaq** / **updateFaq** / **deleteFaq** → `POST` / `PUT` / `DELETE` on `/api/faqs`. |


