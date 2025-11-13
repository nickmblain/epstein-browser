<template>
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
        <span v-if="searchQuery">Filtered documents: {{ filteredDocuments.length }}</span>
      </div>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for 'Trump' or 'Netanyahu'."
        class="search-input"
        :disabled="searchLoading"
      />
      <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
        Clear
      </button>
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
          <span class="doc-id">{{ doc.id }}</span>
          <div class="doc-badges">
            <span v-if="doc.matchCount > 0" class="badge match-badge">
              {{ doc.matchCount }} match{{ doc.matchCount > 1 ? 'es' : '' }}
            </span>
            <span v-if="doc.pageCount > 0" class="badge pages-badge">
              {{ doc.pageCount }} pages
            </span>
          </div>
        </div>
        <div v-if="doc.snippet" class="doc-snippet">
          {{ doc.snippet.snippet }}
        </div>
      </div>

      <div v-if="filteredDocuments.length === 0" class="no-results">
        No documents found matching "{{ searchQuery }}"
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDocuments } from '../composables/useDocuments'

const {
  documents,
  loading,
  error,
  searchQuery,
  selectedDocument,
  filteredDocuments,
  documentsWithText,
  searchLoading,
  loadDocuments
} = useDocuments()

const emit = defineEmits(['select-document', 'close-sidebar'])

function selectDocument(doc) {
  selectedDocument.value = doc
  emit('select-document', doc)
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.document-browser {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
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
}

.clear-btn:hover {
  background: #d0d0d0;
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

.doc-id {
  font-weight: 500;
  color: #333;
  font-size: 0.875rem;
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
  background: #f3e5f5;
  color: #7b1fa2;
}

.match-badge {
  background: #fff3e0;
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
