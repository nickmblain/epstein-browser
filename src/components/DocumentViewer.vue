<template>
  <div class="document-viewer">
    <div v-if="!document" class="empty-state">
      <p>Select a document to view its content</p>
    </div>

    <div v-else class="viewer-content">
      <div class="document-header">
        <div class="header-content">
          <img
            src="https://media.gettyimages.com/id/1154618548/photo/in-this-handout-provided-by-the-florida-department-of-law-enforcement-jeffrey-epstein-poses.jpg?s=612x612&w=0&k=20&c=Y8mLoBhck0WLuHSj-VtaLcWU04mySh5DjM0TrCECH_Y="
            alt="Document icon"
            class="header-icon"
          />
          <div class="header-info">
            <h2>{{ document.id }}</h2>
            <div class="document-meta">
              <span v-if="document.pageCount > 0">{{ document.pageCount }} pages</span>
            </div>
          </div>
          <button
            class="share-btn"
            @click="shareDocument"
            title="Share document link"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <span class="share-text">Share</span>
            <span v-if="showCopied" class="copied-tooltip">Link copied!</span>
          </button>
          <div class="attribution">
            Built by Nick because transparency matters.
          </div>
        </div>
      </div>

      <div class="content-area">
        <div v-if="totalMatches > 0" class="match-navigator">
          <button
            class="nav-btn"
            @click="previousMatch"
            title="Previous match"
            :disabled="totalMatches === 0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="match-counter">{{ currentMatchIndex + 1 }} of {{ totalMatches }}</span>
          <button
            class="nav-btn"
            @click="nextMatch"
            title="Next match"
            :disabled="totalMatches === 0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div class="text-view">
          <div v-if="loadingText" class="loading">
            Loading text...
          </div>
          <div v-else-if="textError" class="error">
            {{ textError }}
          </div>
          <div v-else-if="textContent" class="text-content" v-html="highlightedText">
          </div>
          <div v-else class="no-content">
            No text content available for this document
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useDocuments } from '../composables/useDocuments'

const props = defineProps({
  document: Object,
  searchTerms: Array
})

const { loadDocumentText } = useDocuments()

const textContent = ref('')
const loadingText = ref(false)
const textError = ref(null)
const showCopied = ref(false)
const currentMatchIndex = ref(0)
const totalMatches = ref(0)

// Color palette for search terms (same as DocumentBrowser)
const colorPalette = [
  { bg: '#fff3cd', text: '#856404' }, // yellow
  { bg: '#d4edda', text: '#155724' }, // green
  { bg: '#d1ecf1', text: '#0c5460' }, // blue
  { bg: '#f8d7da', text: '#721c24' }, // pink
  { bg: '#ffe5cc', text: '#8b4513' }, // orange
  { bg: '#e2d9f3', text: '#4a235a' }, // purple
]

// Highlight multiple search terms in different colors
const highlightedText = computed(() => {
  if (!textContent.value || !props.searchTerms || props.searchTerms.length === 0) {
    return textContent.value
  }

  // Escape HTML first
  let escaped = textContent.value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Create an array of matches with their positions
  const matches = []
  props.searchTerms.forEach((term, index) => {
    const regex = new RegExp(escapeRegex(term), 'gi')
    let match
    while ((match = regex.exec(escaped)) !== null) {
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

  // Store total matches count
  totalMatches.value = nonOverlapping.length

  // Apply highlights from end to start
  // Mark each match with an id for navigation
  for (let i = 0; i < nonOverlapping.length; i++) {
    const match = nonOverlapping[i]
    const color = colorPalette[match.colorIndex % colorPalette.length]
    const before = escaped.substring(0, match.start)
    const matchId = nonOverlapping.length - i - 1 // Reverse to get document order
    const isCurrent = matchId === currentMatchIndex.value
    const highlighted = `<mark id="match-${matchId}" class="${isCurrent ? 'current-match' : ''}" style="background-color: ${color.bg}; color: ${color.text};">${match.term}</mark>`
    const after = escaped.substring(match.end)
    escaped = before + highlighted + after
  }

  return escaped
})

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function scrollToMatch(index) {
  await nextTick()
  const match = document.getElementById(`match-${index}`)
  if (match) {
    match.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function nextMatch() {
  if (totalMatches.value === 0) return
  currentMatchIndex.value = (currentMatchIndex.value + 1) % totalMatches.value
  scrollToMatch(currentMatchIndex.value)
}

function previousMatch() {
  if (totalMatches.value === 0) return
  currentMatchIndex.value = (currentMatchIndex.value - 1 + totalMatches.value) % totalMatches.value
  scrollToMatch(currentMatchIndex.value)
}

async function shareDocument() {
  if (!props.document) return

  const url = new URL(window.location.href)
  url.searchParams.set('doc', props.document.id)

  // Add search terms to URL if any exist
  if (props.searchTerms && props.searchTerms.length > 0) {
    url.searchParams.set('terms', props.searchTerms.join(','))
  } else {
    url.searchParams.delete('terms')
  }

  try {
    await navigator.clipboard.writeText(url.toString())
    showCopied.value = true
    setTimeout(() => {
      showCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

watch(
  () => props.document,
  async (newDoc) => {
    if (!newDoc) return

    // Reset state
    textContent.value = ''
    textError.value = null
    currentMatchIndex.value = 0
    totalMatches.value = 0

    // Load text if available
    if (newDoc.hasText) {
      loadingText.value = true
      try {
        const text = await loadDocumentText(newDoc.id)
        if (text) {
          textContent.value = text
          // Scroll to first match after content is loaded
          if (props.searchTerms && props.searchTerms.length > 0) {
            await nextTick()
            scrollToMatch(0)
          }
        } else {
          textError.value = 'Text file not found'
        }
      } catch (err) {
        textError.value = `Failed to load text: ${err.message}`
      } finally {
        loadingText.value = false
      }
    }
  },
  { immediate: true }
)

// Watch for search term changes and scroll to first match
watch(
  () => props.searchTerms,
  () => {
    currentMatchIndex.value = 0
    if (textContent.value && props.searchTerms && props.searchTerms.length > 0) {
      scrollToMatch(0)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.document-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.125rem;
}

.viewer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.document-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.attribution {
  font-size: 0.75rem;
  color: #999;
  margin-left: auto;
  padding-left: 1rem;
  white-space: nowrap;
  align-self: center;
}

.document-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.document-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
}

.document-meta span {
  padding: 0.25rem 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
}

.has-text {
  background: #e3f2fd !important;
  color: #1976d2 !important;
}

.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.match-navigator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;
  border-radius: 4px;
}

.nav-btn:hover:not(:disabled) {
  background: #e0e0e0;
  color: #333;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn svg {
  display: block;
}

.match-counter {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.text-view {
  height: 100%;
  overflow-y: auto;
}

.text-content {
  padding: 1.5rem;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #333;
}

.loading,
.error,
.no-content {
  padding: 2rem;
  text-align: center;
}

.error {
  color: #d32f2f;
}

.text-content mark {
  padding: 2px 4px;
  font-weight: 600;
  border-radius: 3px;
}

.text-content mark.current-match {
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.4);
  outline: 2px solid #4a90e2;
  outline-offset: 1px;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4a90e2;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  margin-left: 1rem;
  align-self: center;
}

.share-btn:hover {
  background: #357abd;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.3);
}

.share-btn:active {
  transform: translateY(0);
}

.share-btn svg {
  display: block;
}

.share-text {
  display: inline;
}

.copied-tooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  background: #333;
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .document-header {
    padding: 1rem;
    padding-top: 4.5rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .document-header h2 {
    font-size: 1.125rem;
  }

  .document-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .document-meta span {
    font-size: 0.75rem;
  }

  .attribution {
    display: none;
  }

  .match-navigator {
    padding: 0.375rem 0.5rem;
    top: 0.5rem;
    right: 0.5rem;
  }

  .match-counter {
    font-size: 0.75rem;
    min-width: 50px;
  }

  .nav-btn svg {
    width: 14px;
    height: 14px;
  }

  .share-btn {
    padding: 0.5rem;
    margin-left: 0.5rem;
  }

  .share-text {
    display: none;
  }

  .share-btn svg {
    width: 18px;
    height: 18px;
  }
}
</style>
