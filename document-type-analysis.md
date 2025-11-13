# Document Type Analysis - Search Index

## Summary Statistics
- Total documents: 23,124
- Emails: 2,424 (10.5%)
- Books: 23 (0.1%)
- Misc: 444 (1.9%)
- **Remaining (no text or short text): 20,233 (87.5%)**

## Sample Analysis (30 Misc Documents)

### Document Type Classification

#### 1. COURT TRANSCRIPTS / DEPOSITIONS (4 documents - 13.3%)

**Sample 11: HOUSE_OVERSIGHT_021824**
- Type: Deposition Transcript
- Key markers:
  - "ROUGH DRAFT TRANSCRIPT"
  - "CASE NAME:" followed by vs.
  - "WITNESS NAME:"
  - "DATE OF DEPOSITION:"
  - Line numbering (1, 2, 3...)
  - Legal disclaimers about unedited/unproofread status
  - Stenotype notes about conflicts and untranslates

**Detection Pattern:**
```javascript
/rough\s+draft\s+transcript/i
/case\s+name:/i
/witness\s+name:/i
/date\s+of\s+deposition:/i
/deposition/i && /transcript/i
/stenotype/i
```

---

#### 2. LEGAL DOCUMENTS / COURT FILINGS (3 documents - 10%)

**Sample 6: HOUSE_OVERSIGHT_025939**
- Type: Legal Declaration/Affidavit
- Key markers:
  - "Case 1:16-cv-04642 Document"
  - "DECLARATION IN SUPPORT OF"
  - "I, [Name], the Plaintiff"
  - Numbered paragraphs
  - "I am a competent adult over 18 years of age"
  - Legal language about testimony

**Sample 8: HOUSE_OVERSIGHT_017830**
- Type: Court Opinion/Ruling
- Key markers:
  - "IN RE [CASE NAME]"
  - "Cite as [citation]"
  - Legal citations and case references
  - Numbered sections
  - References to jurisdiction, plaintiffs, defendants

**Sample 3: HOUSE_OVERSIGHT_017792**
- Type: Court Exhibit
- Key markers:
  - "Case 1:19-cv-03377 Document 1-4 Filed"
  - "EXHIBIT [number]"
  - URLs to legal/news sources

**Detection Pattern:**
```javascript
/case\s+\d+:\d+-cv-\d+/i
/declaration\s+in\s+support/i
/exhibit\s+\d+/i
/plaintiff|defendant/i
/in\s+re\s+[A-Z]/i
/cite\s+as\s+\d+/i
/^\d+\.\s+[A-Z]/m  // Numbered legal paragraphs
```

---

#### 3. FORMAL LETTERS / CORRESPONDENCE (1 document - 3.3%)

**Sample 9: HOUSE_OVERSIGHT_019221**
- Type: Legal Letter
- Key markers:
  - Attorney letterhead with firm name and address
  - "VIA FACSIMILE CONFIDENTIAL"
  - Date
  - Recipient address
  - "Dear [Title] [Name]:"
  - Formal closing
  - Reference to "our client"

**Detection Pattern:**
```javascript
/^[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+$/m  // Name in letterhead
/(LLP|LLC|P\.A\.|Esq\.)/
/^Via\s+(Facsimile|Email|Mail)/im
/^Dear\s+(Judge|Mr\.|Ms\.|Dr\.)/im
/our\s+client/i
/this\s+letter/i
```

---

#### 4. FINANCIAL/INVESTMENT REPORTS (4 documents - 13.3%)

**Sample 2: HOUSE_OVERSIGHT_014532**
- Type: Investment Outlook Report
- Key markers:
  - "Investment Management Division"
  - "Investment Strategy Group"
  - "Chief Investment Officer"
  - Author credentials (Managing Director, Vice President)
  - "Dear Clients,"
  - Economic forecasts and analysis

**Sample 4: HOUSE_OVERSIGHT_014410**
- Type: Economic Analysis Report
- Key markers:
  - "Economics Viewpoint"
  - Date format
  - GDP, inflation forecasts
  - "Consensus underestimating"
  - Economic terminology

**Sample 17: HOUSE_OVERSIGHT_025296**
- Type: Investment Research Report
- Key markers:
  - "Supply-Side Investment Research"
  - Author credentials (Ph.D.)
  - Market indicators (T-Note, DJIA, NASDAQ, S&P 500)
  - "Summary" section
  - Economic analysis

**Detection Pattern:**
```javascript
/investment\s+(management|strategy|outlook)/i
/chief\s+investment\s+officer/i
/managing\s+director/i
/dear\s+clients/i
/(GDP|inflation|CPI|economic|fiscal|monetary)/i
/(DJIA|NASDAQ|S&P\s+500|portfolio)/i
/\d+-yr\s+T-Note/i
```

---

#### 5. NEWS ARTICLES (6 documents - 20%)

**Sample 3: HOUSE_OVERSIGHT_017792** (partial)
**Sample 13: HOUSE_OVERSIGHT_022987**
**Sample 14: HOUSE_OVERSIGHT_023125**
**Sample 24: HOUSE_OVERSIGHT_029452**
**Sample 26: HOUSE_OVERSIGHT_030333**
**Sample 27: HOUSE_OVERSIGHT_031171**

- Type: News Article
- Key markers:
  - URL/web source
  - "By [Author Name]"
  - Timestamp (date and time)
  - Article title
  - Byline format
  - News outlet names
  - "The Associated Press"

**Detection Pattern:**
```javascript
/https?:\/\/[^\s]+/
/^By\s+[A-Z][a-z]+\s+[A-Z][a-z]+/im
/\d{1,2}:\d{2}\s+(am|pm|AM|PM)/
/(The\s+)?(New\s+York\s+Times|Washington\s+Post|Associated\s+Press|Reuters)/i
/^\w+,\s+\w+\s+\d{1,2},\s+\d{4}/m  // Date format
```

---

#### 6. MAGAZINE ARTICLES (3 documents - 10%)

**Sample 3: HOUSE_OVERSIGHT_013268**
- Type: Aviation Magazine
- Key markers:
  - Currency codes (AUD, BND, RMB, etc.)
  - Price listings
  - Article titles with pipe separators
  - "by [Author]"
  - Magazine-style layout markers

**Sample 10: HOUSE_OVERSIGHT_019864**
- Type: Entertainment Article
- Key markers:
  - All-caps title
  - Byline "By [Author Name]"
  - Celebrity/entertainment content
  - Oscar/Academy Awards references

**Detection Pattern:**
```javascript
/^[A-Z\s]{10,}$/m  // All-caps headline
/\|\s*[A-Z]/  // Pipe separators
/(AUD|BND|RMB|HKD|INR|IDR|KRW)\d+/  // Currency codes
/Oscar|Academy\s+Award/i
```

---

#### 7. BOOK PROPOSALS/PUBLISHING DOCUMENTS (3 documents - 10%)

**Sample 5: HOUSE_OVERSIGHT_015032**
- Type: Book Information Page
- Key markers:
  - "Introduction by"
  - "Blurb by"
  - "What They Say About the Author"
  - Author quotes
  - Publisher information

**Sample 7: HOUSE_OVERSIGHT_016804**
- Type: Book Proposal
- Key markers:
  - "National Pub date:"
  - "Title:" "Subtitle:" "By:"
  - "Length: [number] words"
  - "Headline:"
  - "Description:"

**Detection Pattern:**
```javascript
/^(Title|Subtitle|By|Length|Headline|Description):/im
/National\s+Pub\s+date:/i
/^\d{1,3},\d{3}\s+words$/m
/Introduction\s+by/i
/Blurb\s+by/i
```

---

#### 8. PRESS RELEASES/ANNOUNCEMENTS (2 documents - 6.7%)

**Sample 5: HOUSE_OVERSIGHT_023438**
- Type: Press Release
- Key markers:
  - Company letterhead with full address
  - All-caps title/announcement
  - Date and location format
  - "announced today"
  - "According to [spokesperson]"
  - Quote format

**Detection Pattern:**
```javascript
/announced\s+today/i
/according\s+to\s+[A-Z]/i
/^\s*New\s+York,\s+NY,\s+\w+,\s+\w+\s+\d+,\s+\d{4}/m
/Press\s+Release/i
```

---

#### 9. INTERVIEW TRANSCRIPTS (2 documents - 6.7%)

**Sample 15: HOUSE_OVERSIGHT_023644**
- Type: Television Interview Transcript
- Key markers:
  - "The text of the television interview"
  - Q&A format with * or bullet markers
  - Question followed by answer format
  - "he stated the followings:"

**Sample 19: HOUSE_OVERSIGHT_026731**
- Type: Lecture Transcript
- Key markers:
  - Quote marks around title
  - Venue and date
  - "It's a great honour to give this"
  - First-person narrative
  - Academic setting

**Detection Pattern:**
```javascript
/television\s+interview/i
/^\*\s+[A-Z]/m  // Bullet-point Q&A
/lecture/i
/transcript/i && !/deposition/i
```

---

#### 10. SPEECHES/REMARKS (2 documents - 6.7%)

**Sample 20: HOUSE_OVERSIGHT_027009**
- Type: Prepared Speech
- Key markers:
  - All-caps title with person/organization
  - Bullet points (•)
  - Salutations ("Good evening to you all")
  - "Thank you for"
  - Political/diplomatic language

**Detection Pattern:**
```javascript
/^•\s+[A-Z]/m  // Bullet-pointed speech notes
/(Good\s+evening|Ladies\s+and\s+gentlemen|Thank\s+you\s+for)/i
/SPEECH|REMARKS/i
```

---

#### 11. DATA FILES/SPREADSHEETS (1 document - 3.3%)

**Sample 6: HOUSE_OVERSIGHT_016552**
- Type: Property Records Database Export
- Key markers:
  - Column headers (PCN, OWNERNAME, etc.)
  - Tab or space-delimited data
  - Numeric codes
  - Repeated structured format
  - Field names in all caps

**Detection Pattern:**
```javascript
/^[A-Z_]+\s+[A-Z_]+\s+[A-Z_]+/m  // Multiple caps headers
/\d{14,}/  // Long numeric IDs
/(PCN|CAMA|ADDR|PROP)/  // Database field abbreviations
```

---

#### 12. ORGANIZATIONAL/PROGRAM MATERIALS (2 documents - 6.7%)

**Sample 12: HOUSE_OVERSIGHT_022407**
- Type: Organization Mission Statement
- Key markers:
  - "Our Mission"
  - "Our Target Audience"
  - "Our Approach"
  - Bulleted objectives
  - Non-profit/NGO language

**Sample 16: HOUSE_OVERSIGHT_024294**
- Type: Legislative Accomplishments Document
- Key markers:
  - "FIRST TERM ACCOMPLISHMENTS"
  - Date range
  - Bulleted achievements
  - "Named to" / "Selected to"
  - Political/legislative terminology

**Detection Pattern:**
```javascript
/Our\s+(Mission|Vision|Approach|Values)/i
/ACCOMPLISHMENTS/i
/(Named\s+to|Selected\s+to|Appointed\s+to)/i
/^•\s+/m  // Bullet points
```

---

#### 13. PROFILE/BIO PAGES (2 documents - 6.7%)

**Sample 8: HOUSE_OVERSIGHT_029539**
- Type: Profile Interview/Article
- Key markers:
  - "Patt Morrison Asks"
  - "About [Person Name]"
  - Biographical information
  - Position titles

**Sample 25: HOUSE_OVERSIGHT_029918**
- Type: Biography Page
- Key markers:
  - "About [Person Name]"
  - "Chief Deputy Whip" (title)
  - Career history
  - "8th term member"
  - Congressional district information

**Detection Pattern:**
```javascript
/^About\s+[A-Z]/im
/\d+(st|nd|rd|th)\s+term/i
/Congressional\s+district/i
/representing/i
```

---

#### 14. APPLICATION/ADMISSION ESSAYS (1 document - 3.3%)

**Sample 22: HOUSE_OVERSIGHT_029102**
- Type: Business School Application
- Key markers:
  - "Dear Harvard Business School"
  - "I am extremely excited to share my application"
  - "my dream to attend"
  - Personal narrative structure
  - "My first story is about"

**Detection Pattern:**
```javascript
/Dear\s+(Harvard|Stanford|MIT|Yale|Princeton)/i
/my\s+application/i
/excited\s+to\s+(share|apply|submit)/i
/my\s+dream\s+to/i
```

---

#### 15. OPINION/COMMENTARY ARTICLES (3 documents - 10%)

**Sample 24: HOUSE_OVERSIGHT_029452**
- Type: Opinion/Analysis Piece
- Key markers:
  - "Commentary by:"
  - Author byline
  - News outlet attribution
  - Opinion/editorial language
  - First-person or analytical tone

**Sample 28: HOUSE_OVERSIGHT_031716**
- Type: Political Commentary
- Key markers:
  - "FORTUNE INSIDERS"
  - "Commentary by:"
  - "For decades, the U.S. has pursued"
  - Policy analysis

**Detection Pattern:**
```javascript
/Commentary\s+by:/i
/(Opinion|Editorial|Analysis)/i
/INSIDERS|VIEWPOINT/i
```

---

#### 16. REPORTS/ANALYTICS (1 document - 3.3%)

**Sample 29: HOUSE_OVERSIGHT_032281**
- Type: Data Analysis Report
- Key markers:
  - "US Presidential Election Report"
  - "based on data collected from"
  - Statistical information (percentages)
  - "We have processed"
  - Tables with data

**Detection Pattern:**
```javascript
/^[A-Z\s]+Report$/im
/based\s+on\s+data/i
/we\s+have\s+(processed|collected|analyzed)/i
/\d+\.?\d*%/  // Percentages
```

---

#### 17. JSON/STRUCTURED DATA (1 document - 3.3%)

**Sample 21: HOUSE_OVERSIGHT_028397**
- Type: JSON/Apple News Format
- Key markers:
  - Starts with `{"componentLayouts"`
  - JSON structure
  - Technical field names
  - No readable narrative text

**Detection Pattern:**
```javascript
/^\s*\{["'][a-zA-Z]+['"]/  // Starts with JSON
/componentLayouts|columnRange/i
/identifier.*margin/i
```

---

#### 18. SOCIAL MEDIA SCREENSHOTS (1 document - 3.3%)

**Sample 30: HOUSE_OVERSIGHT_033433**
- Type: Social Media Screenshot (Twitter)
- Key markers:
  - Timestamps (hours/days ago)
  - Social media UI elements
  - Tweet/post format
  - Username mentions

**Detection Pattern:**
```javascript
/\d+\s+(hours?|days?|minutes?)\s+ago/i
/Twitter|Facebook|Instagram/i
/Replied-All|Retweeted/i
```

---

#### 19. SIGNATURE BLOCKS (1 document - 3.3%)

**Sample 9: HOUSE_OVERSIGHT_031425**
- Type: Email Signature
- Key markers:
  - Name and credentials
  - Law firm name
  - Address
  - Disclaimer text
  - "Board Certified"
  - "This e-mail may contain"

**Detection Pattern:**
```javascript
/Board\s+Certified/i
/This\s+e-mail\s+may\s+contain\s+(privileged|confidential)/i
/PA$|LLP$|LLC$/m  // Firm suffixes
/Please\s+confirm\s+receipt/i
```

---

#### 20. MISCELLANEOUS/OTHER (1 document - 3.3%)

**Sample 18: HOUSE_OVERSIGHT_026520**
- Type: Foreign Language News (Spanish)
- Key markers:
  - Foreign language text
  - News format
  - Date and publication markers

**Detection Pattern:**
```javascript
// Detect non-English patterns
/\b(el|la|los|las|de|por|para)\b/i  // Spanish
/\b(le|la|les|de|pour|par)\b/i  // French
```

---

## Recommended New Document Types

Based on prevalence and detectability, I recommend adding these types:

### High Priority (Common & Easily Detectable)

1. **transcript** (20% of misc) - Depositions, interviews, lectures
   - Very distinct patterns
   - High prevalence

2. **news** (20% of misc) - News articles
   - Clear markers (URLs, bylines, timestamps)
   - High prevalence

3. **legal** (13.3% of misc) - Court filings, declarations, opinions
   - Distinct legal format
   - Important category

4. **financial** (13.3% of misc) - Investment reports, economic analysis
   - Clear terminology
   - Distinct structure

### Medium Priority (Moderate Prevalence)

5. **magazine** (10% of misc) - Magazine articles
   - Different from news (layout, style)

6. **book_proposal** (10% of misc) - Publishing documents
   - Distinct from books themselves

7. **speech** (6.7% of misc) - Prepared remarks
   - Bullet-point format
   - Salutations

8. **interview** (6.7% of misc) - Q&A transcripts
   - Different from depositions

9. **bio** (6.7% of misc) - Profile pages
   - "About" format

10. **report** (10% of misc) - Data reports, analytics
    - Different from financial reports

### Lower Priority (Less Common)

11. **press_release** (6.7% of misc)
12. **correspondence** (3.3% of misc) - Formal letters
13. **data** (3.3% of misc) - Spreadsheets, databases
14. **org_materials** (6.7% of misc) - Mission statements, accomplishments
15. **social_media** (3.3% of misc) - Screenshots

---

## Implementation Recommendations

### Suggested Detection Order
1. Check for JSON/structured data first (eliminates noise)
2. Check for legal documents (case numbers, exhibits)
3. Check for transcripts (very distinct)
4. Check for news (URLs, bylines)
5. Check for financial reports (specific terminology)
6. Check for books/publishing
7. Check for speeches/interviews
8. Check for bios
9. Fall back to misc

### Sample Detection Code

```javascript
function detectDocumentType(text) {
  if (!text || text.length < 100) return 'unknown';

  const first500 = text.substring(0, 500);
  const first1000 = text.substring(0, 1000);

  // JSON/structured data
  if (/^\s*\{["'][a-zA-Z]+['"]/.test(first500)) {
    return 'data';
  }

  // Legal documents
  if (/case\s+\d+:\d+-cv-\d+/i.test(first500) ||
      /exhibit\s+\d+/i.test(first500) ||
      /declaration\s+in\s+support/i.test(first500)) {
    return 'legal';
  }

  // Transcripts (deposition)
  if (/rough\s+draft\s+transcript/i.test(first500) &&
      /deposition/i.test(first500)) {
    return 'transcript';
  }

  // News articles
  if (/https?:\/\/[^\s]+/.test(first500) &&
      /^By\s+[A-Z][a-z]+/im.test(first500)) {
    return 'news';
  }

  // Financial reports
  if (/(investment|portfolio|GDP|inflation|S&P\s+500)/i.test(first500) &&
      /(outlook|forecast|analysis)/i.test(first500)) {
    return 'financial';
  }

  // Book proposals
  if (/^(Title|Subtitle|Pub\s+date):/im.test(first500)) {
    return 'book_proposal';
  }

  // Speeches
  if (/^•\s+[A-Z]/m.test(first500) &&
      /(Thank\s+you|Good\s+evening)/i.test(first500)) {
    return 'speech';
  }

  // Interviews
  if (/television\s+interview/i.test(first500) ||
      (/^\*\s+/.test(first500) && /^-\s+/.test(first500))) {
    return 'interview';
  }

  // Bios
  if (/^About\s+[A-Z]/im.test(first500)) {
    return 'bio';
  }

  // Already have email and book detection
  if (isEmail(text)) return 'email';
  if (isBook(text)) return 'book';

  return 'misc';
}
```

---

## Expected Impact

If we implement the top 10 new types, we should be able to classify:
- Transcripts: ~89 documents (20% of 444)
- News: ~89 documents (20%)
- Legal: ~59 documents (13.3%)
- Financial: ~59 documents (13.3%)
- Other types: ~89 documents combined

**Total reduction in 'misc': ~385 documents (86.7%)**
**New 'misc' count: ~59 documents (13.3%)**

This would improve classification from **1.9% misc** to **0.25% misc** of total corpus.
