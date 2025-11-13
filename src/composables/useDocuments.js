import { ref, computed } from 'vue'

// Shared state across all components (singleton pattern)
const documents = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const selectedDocument = ref(null)
const searchIndex = ref(null) // Pre-built search index
const searchLoading = ref(false)
const activeFilters = ref({
  hasText: true,
  noText: false,
  hasNative: false,
  hasPages: false
})

export function useDocuments() {

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

      // Build documents array from index
      documents.value = searchIndex.value.documents.map(doc => {
        return {
          id: doc.id,
          hasText: doc.hasText,
          pageCount: doc.pageCount,
          index: doc.index
        }
      })

      const loadTime = ((Date.now() - startTime) / 1000).toFixed(2)
      console.log(`✓ Loaded search index in ${loadTime}s`)
      console.log(`  Total documents: ${searchIndex.value.stats.total}`)
      console.log(`  Searchable documents: ${searchIndex.value.stats.indexed}`)

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
    if (!hasActiveFilters.value) return docs

    return docs.filter(doc => {
      // If hasText filter is active, only show docs with text
      if (activeFilters.value.hasText && !doc.hasText) return false

      // If noText filter is active, only show docs without text
      if (activeFilters.value.noText && doc.hasText) return false

      // If hasPages filter is active, only show docs with page count
      if (activeFilters.value.hasPages && doc.pageCount === 0) return false

      return true
    })
  }

  // Filter documents based on search query (ID or content)
  const filteredDocuments = computed(() => {
    let results = []

    // If no search query, return all documents
    if (!searchQuery.value.trim() || !searchIndex.value) {
      results = documents.value.map(doc => ({ ...doc, snippet: null, matchCount: 0 }))
    } else {
      // Search through documents
      const query = searchQuery.value.toLowerCase()

      for (let i = 0; i < documents.value.length; i++) {
        const doc = documents.value[i]
        const indexDoc = searchIndex.value.documents[i]

        let matchCount = 0
        let snippet = null

        // Check if ID matches
        const idMatch = doc.id.toLowerCase().includes(query)

        // Check if content matches (use pre-indexed searchText)
        if (indexDoc.searchText) {
          // Count matches using the pre-lowercased search text
          let pos = 0
          while ((pos = indexDoc.searchText.indexOf(query, pos)) !== -1) {
            matchCount++
            pos += query.length
          }

          // Extract first match snippet using original text
          if (matchCount > 0 && indexDoc.text) {
            snippet = extractSnippet(indexDoc.text, query)
          }
        }

        // Include document if ID matches or content matches
        if (idMatch || matchCount > 0) {
          results.push({
            ...doc,
            snippet,
            matchCount,
            idMatch
          })
        }
      }

      // Sort results: ID matches first, then by match count
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
    selectedDocument,
    filteredDocuments,
    documentsWithText,
    searchLoading,
    searchIndex,
    activeFilters,
    hasActiveFilters,
    loadDocuments,
    loadDocumentText,
    checkNativeFile
  }
}
