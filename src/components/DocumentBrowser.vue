<template>
  <div class="document-browser-wrapper">
    <WordCloud />
    <div class="document-browser">
      <div class="header">
        <div class="header-top">
          <h1>Epstein Browser</h1>
          <button class="close-btn" @click="$emit('close-sidebar')" aria-label="Close sidebar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="stats" v-if="!loading">
          <span>Total documents: {{ documents.length }}</span>
          <span v-if="searchTerms.length > 0">Filtered documents: {{ filteredDocuments.length }}</span>
        </div>
      </div>

      <div class="search-bar">
        <div class="search-bar-content">
          <div class="search-chips-container">
            <div
              v-for="(term, index) in searchTerms"
              :key="index"
              class="search-chip"
              :style="{ backgroundColor: getTermColor(index), color: getTermTextColor(index) }"
            >
              <span>{{ term }}</span>
              <button @click="removeTerm(index)" class="chip-remove" :aria-label="`Remove ${term}`">
                ×
              </button>
            </div>
            <input
              v-model="currentInput"
              @keydown.enter="addTerm"
              @keydown.backspace="handleBackspace"
              type="text"
              placeholder="Type and press Enter to add..."
              class="chip-input"
              :disabled="searchLoading"
            />
          </div>
          <p class="search-hint">Add multiple terms to find documents containing all of them</p>
        </div>
        <button v-if="searchTerms.length > 0" @click="clearAllTerms" class="clear-btn">
          Clear All
        </button>
      </div>

      <div v-if="searchTerms.length > 0" class="color-legend">
        <span class="legend-title">Highlighting:</span>
        <div class="legend-items">
          <div
            v-for="(term, index) in searchTerms"
            :key="index"
            class="legend-item"
          >
            <span
              class="legend-color"
              :style="{ backgroundColor: getTermColor(index) }"
            ></span>
            <span class="legend-text">{{ term }}</span>
          </div>
        </div>
      </div>

      <div v-if="searchLoading" class="search-loading">
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
        <p>Loading search index...</p>
      </div>

      <div v-if="loading" class="loading">
        Loading documents...
      </div>

      <div v-else-if="error" class="error">
        {{ error }}
      </div>

      <div v-else class="document-list">
        <div
          v-for="doc in filteredDocuments"
          :key="doc.id"
          class="document-item"
          :class="{ selected: selectedDocument?.id === doc.id }"
          @click="selectDocument(doc)"
        >
          <div class="doc-header">
            <div class="doc-info">
              <span class="doc-id">{{ doc.id }}</span>
              <span class="doc-date">Released: 11/12/2025</span>
            </div>
            <div class="doc-badges">
              <span v-if="doc.matchCount > 0" class="badge match-badge">
                {{ doc.matchCount }} match{{ doc.matchCount > 1 ? 'es' : '' }}
              </span>
              <span v-if="doc.pageCount > 0" class="badge pages-badge">
                {{ doc.pageCount }} pages
              </span>
            </div>
          </div>
          <div v-if="doc.snippet" class="doc-snippet" v-html="highlightSnippet(doc.snippet.snippet)">
          </div>
        </div>

        <div v-if="filteredDocuments.length === 0 && searchTerms.length > 0" class="no-results">
          No documents found matching all terms: {{ searchTerms.join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDocuments } from '../composables/useDocuments'
import WordCloud from './WordCloud.vue'

const {
  documents,
  loading,
  error,
  searchQuery,
  searchTerms,
  selectedDocument,
  filteredDocuments,
  documentsWithText,
  searchLoading,
  loadDocuments
} = useDocuments()

const emit = defineEmits(['select-document', 'close-sidebar'])
const currentInput = ref('')

// Color palette for search terms
const colorPalette = [
  { bg: '#fff3cd', text: '#856404' }, // yellow
  { bg: '#d4edda', text: '#155724' }, // green
  { bg: '#d1ecf1', text: '#0c5460' }, // blue
  { bg: '#f8d7da', text: '#721c24' }, // pink
  { bg: '#ffe5cc', text: '#8b4513' }, // orange
  { bg: '#e2d9f3', text: '#4a235a' }, // purple
]

function getTermColor(index) {
  return colorPalette[index % colorPalette.length].bg
}

function getTermTextColor(index) {
  return colorPalette[index % colorPalette.length].text
}

function addTerm() {
  const term = currentInput.value.trim()
  if (term && !searchTerms.value.includes(term)) {
    searchTerms.value.push(term)
    currentInput.value = ''
  }
}

function removeTerm(index) {
  searchTerms.value.splice(index, 1)
}

function clearAllTerms() {
  searchTerms.value = []
  currentInput.value = ''
}

function handleBackspace(e) {
  if (currentInput.value === '' && searchTerms.value.length > 0) {
    searchTerms.value.pop()
  }
}

function highlightSnippet(snippet) {
  if (!snippet || searchTerms.value.length === 0) {
    return snippet
  }

  let highlightedText = snippet

  // Create an array of matches with their positions
  const matches = []
  searchTerms.value.forEach((term, index) => {
    const regex = new RegExp(term, 'gi')
    let match
    while ((match = regex.exec(snippet)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        term: match[0],
        colorIndex: index
      })
    }
  })

  // Sort matches by start position (descending) to replace from end to start
  matches.sort((a, b) => b.start - a.start)

  // Remove overlapping matches (keep the first one found)
  const nonOverlapping = []
  for (const match of matches) {
    const overlaps = nonOverlapping.some(m =>
      (match.start >= m.start && match.start < m.end) ||
      (match.end > m.start && match.end <= m.end)
    )
    if (!overlaps) {
      nonOverlapping.push(match)
    }
  }

  // Apply highlights from end to start
  for (const match of nonOverlapping) {
    const color = colorPalette[match.colorIndex % colorPalette.length]
    const before = highlightedText.substring(0, match.start)
    const highlighted = `<mark style="background-color: ${color.bg}; color: ${color.text}; padding: 2px 4px; border-radius: 3px; font-weight: 600;">${match.term}</mark>`
    const after = highlightedText.substring(match.end)
    highlightedText = before + highlighted + after
  }

  return highlightedText
}

function selectDocument(doc) {
  selectedDocument.value = doc
  emit('select-document', doc)
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-browser-wrapper {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.document-browser {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  position: relative;
  z-index: 1;
}

.header {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  flex: 1;
}

.close-btn {
  display: none;
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
  flex-shrink: 0;
  margin-left: 1rem;
}

.close-btn:hover {
  color: #333;
}

.close-btn svg {
  display: block;
}

.stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.stats span {
  padding: 0.25rem 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.search-bar {
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.search-bar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.search-hint {
  margin: 0;
  font-size: 0.75rem;
  color: #999;
  padding-left: 0.5rem;
}

.search-chips-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 42px;
  background: white;
  align-items: center;
}

.search-chips-container:focus-within {
  border-color: #4a90e2;
}

.search-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
}

.chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  padding: 0 0.125rem;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.chip-remove:hover {
  opacity: 1;
}

.chip-input {
  flex: 1;
  min-width: 150px;
  border: none;
  outline: none;
  font-size: 1rem;
  padding: 0.25rem;
}

.chip-input::placeholder {
  color: #999;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.clear-btn:hover {
  background: #d0d0d0;
}

.color-legend {
  padding: 0.75rem 1.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.legend-text {
  color: #333;
  font-weight: 500;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.document-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.document-item {
  background: white;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.document-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.document-item.selected {
  border-color: #4a90e2;
  background: #f0f7ff;
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.doc-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-id {
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
}

.doc-date {
  font-size: 0.75rem;
  color: #666;
  font-weight: 400;
}

.doc-badges {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.125rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.text-badge {
  background: #e3f2fd;
  color: #1976d2;
}

.pages-badge {
  background: #f0f0f0;
  color: #666;
}

.match-badge {
  background: #ffe0e0;
  color: #e65100;
  font-weight: 600;
}

.doc-snippet {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f9f9f9;
  border-left: 3px solid #4a90e2;
  font-size: 0.75rem;
  color: #555;
  line-height: 1.4;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-loading {
  padding: 1rem 1.5rem;
  background: #fff8e1;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.search-loading p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #666;
}

.loading-bar {
  width: 100%;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #4a90e2, #64b5f6);
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.no-results {
  padding: 2rem;
  text-align: center;
  color: #666;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .close-btn {
    display: block;
  }

  .header h1 {
    font-size: 1.25rem;
    line-height: 1.3;
  }

  .stats {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .stats span {
    font-size: 0.75rem;
  }

  .search-input {
    font-size: 0.875rem;
  }

  .header {
    padding: 1rem;
  }

  .search-bar {
    padding: 0.75rem 1rem;
  }
}
</style>
