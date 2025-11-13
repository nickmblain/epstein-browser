import { ref, computed } from 'vue'

// Shared state across all components (singleton pattern)
const documents = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const searchTerms = ref([]) // Array of search terms for multi-term search
const selectedDocument = ref(null)
const searchIndex = ref(null) // Pre-built search index
const searchLoading = ref(false)
const wordFrequency = ref([]) // Top words by frequency
const activeFilters = ref({
  hasText: true,
  noText: false,
  hasNative: false,
  hasPages: false
})
const typeFilters = ref({
  email: true,
  book: true,
  misc: true
})

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having',
  'may', 'should', 'am', 'being', 'does', 'shall', 'will', 'can', 'might', 'must'
])

export function useDocuments() {

  // Detect document type based on content patterns
  function detectDocumentType(text) {
    if (!text || text.length < 50) return 'misc'

    const lowerText = text.toLowerCase()
    const firstChunk = text.substring(0, 2000) // Analyze first 2000 chars
    const lowerFirstChunk = firstChunk.toLowerCase()

    // Email detection - look for email headers
    const emailPatterns = [
      /^from:/m,
      /^to:/m,
      /^subject:/m,
      /^date:/m,
      /^sent:/m,
      /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
      /^cc:/m,
      /^bcc:/m,
      /^re:/m
    ]

    let emailScore = 0
    for (const pattern of emailPatterns) {
      if (pattern.test(lowerFirstChunk)) {
        emailScore++
      }
    }

    // If we find 3+ email indicators, it's likely an email
    if (emailScore >= 3) return 'email'

    // Book detection - look for structured content
    const bookPatterns = [
      /\bchapter\s+\d+/i,
      /\bchapter\s+[ivxlcdm]+/i, // Roman numerals
      /^chapter\s/im,
      /\bpage\s+\d+/i,
      /\btable of contents\b/i,
      /\bpreface\b/i,
      /\bintroduction\b.*chapter/i
    ]

    let bookScore = 0
    for (const pattern of bookPatterns) {
      if (pattern.test(lowerText)) {
        bookScore++
      }
    }

    // Check for book-like structure (longer paragraphs, chapters)
    if (bookScore >= 2 || lowerFirstChunk.includes('chapter')) {
      return 'book'
    }

    // Default to misc
    return 'misc'
  }

  // Analyze word frequency across all documents
  function analyzeWordFrequency() {
    if (!searchIndex.value) return

    console.log('Analyzing word frequency...')
    const wordCounts = new Map()

    // Analyze all documents
    for (const doc of searchIndex.value.documents) {
      if (!doc.text) continue

      // Split text into words
      const words = doc.text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ') // Remove special characters
        .split(/\s+/)
        .filter(word =>
          word.length > 3 && // At least 4 characters
          !STOP_WORDS.has(word) && // Not a stop word
          !/^\d+$/.test(word) // Not just numbers
        )

      // Count word occurrences
      for (const word of words) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
      }
    }

    // Convert to array, sort by frequency, and take top 50
    const sortedWords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, count]) => ({ word, count }))

    // Filter to only words that appear in at least 10 documents
    wordFrequency.value = sortedWords.filter(item => item.count >= 10)

    console.log(`✓ Found ${wordFrequency.value.length} common words`)
  }

  // Load the pre-built search index
  async function loadDocuments() {
    loading.value = true
    searchLoading.value = true
    error.value = null

    try {
      console.log('Loading search index...')
      const startTime = Date.now()

      const response = await fetch('/search-index.json')
      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.statusText}`)
      }

      searchIndex.value = await response.json()

      // Build documents array from index with type detection
      documents.value = searchIndex.value.documents.map(doc => {
        const docType = doc.text ? detectDocumentType(doc.text) : 'misc'
        return {
          id: doc.id,
          hasText: doc.hasText,
          pageCount: doc.pageCount,
          index: doc.index,
          type: docType
        }
      })

      // Log type distribution
      const typeCounts = documents.value.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1
        return acc
      }, {})
      console.log('  Document types:', typeCounts)

      const loadTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✓ Loaded search index in ${loadTime}s`)
      console.log(`  Total documents: ${searchIndex.value.stats.total}`)
      console.log(`  Searchable documents: ${searchIndex.value.stats.indexed}`)

      // Analyze word frequency after loading
      analyzeWordFrequency()

    } catch (err) {
      error.value = `Failed to load search index: ${err.message}`
      console.error(err)
    } finally {
      loading.value = false
      searchLoading.value = false
    }
  }

  // Load text content for a specific document from the search index
  async function loadDocumentText(docId) {
    if (!searchIndex.value) {
      console.error('Search index not loaded')
      return null
    }

    const doc = searchIndex.value.documents.find(d => d.id === docId)
    return doc?.text || null
  }

  // Load native file if available
  async function checkNativeFile(docId) {
    const extensions = ['xls', 'xlsx', 'mov', 'mp4', 'pdf']

    for (const ext of extensions) {
      try {
        const response = await fetch(`/NATIVES/001/${docId}.${ext}`, { method: 'HEAD' })
        if (response.ok) {
          return `/NATIVES/001/${docId}.${ext}`
        }
      } catch (err) {
        // File doesn't exist, continue
      }
    }

    return null
  }

  // Extract a snippet of text around a search match
  function extractSnippet(text, query, contextLength = 100) {
    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) return null

    const start = Math.max(0, index - contextLength)
    const end = Math.min(text.length, index + query.length + contextLength)

    let snippet = text.slice(start, end)

    // Add ellipsis if we're not at the start/end
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    return {
      snippet,
      matchStart: start > 0 ? index - start + 3 : index - start,
      matchLength: query.length
    }
  }

  // Helper to check if any filters are active
  const hasActiveFilters = computed(() => {
    return Object.values(activeFilters.value).some(v => v === true)
  })

  // Apply filters to a document list
  function applyFilters(docs) {
    return docs.filter(doc => {
      // Type filters
      if (doc.type && !typeFilters.value[doc.type]) return false

      // If hasText filter is active, only show docs with text
      if (activeFilters.value.hasText && !doc.hasText) return false

      // If noText filter is active, only show docs without text
      if (activeFilters.value.noText && doc.hasText) return false

      // If hasPages filter is active, only show docs with page count
      if (activeFilters.value.hasPages && doc.pageCount === 0) return false

      return true
    })
  }

  // Filter documents based on search terms (ID or content) - ALL terms must match (AND logic)
  const filteredDocuments = computed(() => {
    let results = []

    // If no search terms, return all documents
    if (searchTerms.value.length === 0 || !searchIndex.value) {
      results = documents.value.map(doc => ({ ...doc, snippet: null, matchCount: 0, termMatches: {} }))
    } else {
      // Search through documents
      const terms = searchTerms.value.map(t => t.toLowerCase())

      for (let i = 0; i < documents.value.length; i++) {
        const doc = documents.value[i]
        const indexDoc = searchIndex.value.documents[i]

        let totalMatchCount = 0
        let snippet = null
        let idMatch = false
        const termMatches = {} // Track matches per term

        // Check if ALL terms match (AND logic)
        let allTermsMatch = true

        for (const term of terms) {
          let termMatchCount = 0

          // Check if ID matches
          if (doc.id.toLowerCase().includes(term)) {
            idMatch = true
            termMatchCount++
          }

          // Check if content matches (use pre-indexed searchText)
          if (indexDoc.searchText) {
            let pos = 0
            while ((pos = indexDoc.searchText.indexOf(term, pos)) !== -1) {
              termMatchCount++
              pos += term.length
            }
          }

          // If this term has no matches, document doesn't match (AND logic)
          if (termMatchCount === 0) {
            allTermsMatch = false
            break
          }

          termMatches[term] = termMatchCount
          totalMatchCount += termMatchCount
        }

        // Only include document if ALL terms matched
        if (allTermsMatch) {
          // Extract snippet showing the first term match
          if (totalMatchCount > 0 && indexDoc.text) {
            snippet = extractSnippet(indexDoc.text, terms[0])
          }

          results.push({
            ...doc,
            snippet,
            matchCount: totalMatchCount,
            termMatches,
            idMatch
          })
        }
      }

      // Sort results: ID matches first, then by total match count
      results.sort((a, b) => {
        if (a.idMatch && !b.idMatch) return -1
        if (!a.idMatch && b.idMatch) return 1
        return b.matchCount - a.matchCount
      })
    }

    // Apply filters to the results
    return applyFilters(results)
  })

  // Get documents with text
  const documentsWithText = computed(() =>
    documents.value.filter(doc => doc.hasText)
  )

  return {
    documents,
    loading,
    error,
    searchQuery,
    searchTerms,
    selectedDocument,
    filteredDocuments,
    documentsWithText,
    searchLoading,
    searchIndex,
    wordFrequency,
    activeFilters,
    typeFilters,
    hasActiveFilters,
    loadDocuments,
    loadDocumentText,
    checkNativeFile
  }
}
