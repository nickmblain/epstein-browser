<template>
  <div class="word-cloud-container" :class="{ expanded: isExpanded }">
    <button class="toggle-btn" @click="toggleExpanded" :title="isExpanded ? 'Hide word cloud' : 'Show word cloud'">
      <span class="toggle-text">{{ isExpanded ? 'Close' : 'Common Terms' }}</span>
    </button>

    <div class="word-cloud-panel" v-if="isExpanded">
      <div class="panel-header">
        <h3>Common Terms</h3>
        <p class="panel-subtitle">Click to add to search</p>
      </div>

      <div v-if="wordFrequency.length === 0" class="empty-state">
        <p>Loading word analysis...</p>
      </div>

      <div v-else class="word-cloud">
        <button
          v-for="item in wordFrequency"
          :key="item.word"
          class="word-item"
          :class="{ selected: isWordSelected(item.word) }"
          :style="{ fontSize: getWordSize(item.count) + 'px' }"
          @click="addWordToSearch(item.word)"
          :title="`${item.word} (${item.count} occurrences)`"
        >
          {{ item.word }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDocuments } from '../composables/useDocuments'

const { wordFrequency, searchTerms } = useDocuments()
const isExpanded = ref(false)

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function getWordSize(count) {
  // Calculate font size based on frequency
  // Min size: 12px, Max size: 32px
  const minCount = Math.min(...wordFrequency.value.map(w => w.count))
  const maxCount = Math.max(...wordFrequency.value.map(w => w.count))

  if (minCount === maxCount) return 18

  const normalized = (count - minCount) / (maxCount - minCount)
  return Math.floor(12 + normalized * 20)
}

function isWordSelected(word) {
  return searchTerms.value.includes(word)
}

function addWordToSearch(word) {
  // Only add if not already in search terms
  if (!searchTerms.value.includes(word)) {
    searchTerms.value.push(word)
  }
}
</script>

<style scoped>
.word-cloud-container {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
}

.toggle-btn {
  position: absolute;
  right: 100%;
  top: 238px;
  transform: translateY(-50%);
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px 0 0 8px;
  padding: .5rem 0.3rem;
  cursor: pointer;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  min-height: 120px;
  z-index: 20;
}

.toggle-btn:hover {
  background: #357abd;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.15);
}

.toggle-text {
  font-size: 0.675rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.word-cloud-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: white;
  border-left: 1px solid #e0e0e0;
  box-shadow: -2px 0 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.word-cloud-container.expanded .word-cloud-panel {
  transform: translateX(0);
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.panel-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #333;
}

.panel-subtitle {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
}

.word-cloud {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-content: flex-start;
  align-items: center;
  justify-content: center;
}

.word-item {
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1.2;
}

.word-item:hover {
  background: #e3f2fd;
  color: #1976d2;
  transform: scale(1.1);
}

.word-item.selected {
  background: #4a90e2;
  color: white;
}

.word-item.selected:hover {
  background: #357abd;
  color: white;
  transform: scale(1.1);
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 0.675rem;
  padding: 2rem;
  text-align: center;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .word-cloud-panel {
    width: 250px;
  }

  .toggle-btn {
    min-height: 100px;
    font-size: 0.75rem;
  }
}
</style>
