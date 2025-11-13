<script setup>
import { ref, onMounted, watch } from 'vue'
import DocumentBrowser from './components/DocumentBrowser.vue'
import DocumentViewer from './components/DocumentViewer.vue'
import { useDocuments } from './composables/useDocuments'

const { searchQuery, documents, loading } = useDocuments()
const selectedDocument = ref(null)
const sidebarOpen = ref(false)

// Default sidebar to open on mobile
onMounted(() => {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = true
  }
})

// Check for document ID in URL and auto-select it
watch(() => documents.value.length, (newLength) => {
  if (newLength > 0 && !selectedDocument.value) {
    const urlParams = new URLSearchParams(window.location.search)
    const docId = urlParams.get('doc')

    if (docId) {
      const doc = documents.value.find(d => d.id === docId)
      if (doc) {
        handleDocumentSelect(doc)
      }
    }
  }
})

function handleDocumentSelect(doc) {
  selectedDocument.value = doc

  // Update URL without reloading the page
  const url = new URL(window.location.href)
  url.searchParams.set('doc', doc.id)
  window.history.pushState({}, '', url)

  // Close sidebar on mobile after selecting a document
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}
</script>

<template>
  <div class="app-container">
    <!-- Mobile menu button -->
    <button
      class="mobile-menu-btn"
      :class="{ hidden: sidebarOpen }"
      @click="toggleSidebar"
      aria-label="Toggle menu"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <!-- Overlay for mobile when sidebar is open -->
    <div
      v-if="sidebarOpen"
      class="overlay"
      @click="closeSidebar"
    ></div>

    <div class="browser-pane" :class="{ open: sidebarOpen }">
      <DocumentBrowser @select-document="handleDocumentSelect" @close-sidebar="closeSidebar" />
    </div>
    <div class="viewer-pane">
      <DocumentViewer :document="selectedDocument" :search-query="searchQuery" />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.browser-pane,
.viewer-pane {
  height: 100vh;
  overflow: hidden;
}

.browser-pane {
  border-right: 1px solid #e0e0e0;
}

/* Mobile menu button - hidden on desktop */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: #f5f5f5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mobile-menu-btn svg {
  display: block;
  color: #333;
}

.mobile-menu-btn.hidden {
  opacity: 0;
  pointer-events: none;
  transform: scale(0.8);
}

/* Overlay for mobile */
.overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Mobile responsive styles */
@media (max-width: 768px) {
  .app-container {
    grid-template-columns: 1fr;
  }

  .mobile-menu-btn {
    display: block;
  }

  .overlay {
    display: block;
  }

  .browser-pane {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 85%;
    max-width: 400px;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    background: white;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .browser-pane.open {
    transform: translateX(0);
  }

  .viewer-pane {
    grid-column: 1;
  }
}

/* Tablet styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-container {
    grid-template-columns: 350px 1fr;
  }
}
</style>
