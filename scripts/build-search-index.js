import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '..', 'public')
const optFile = path.join(publicDir, 'DATA', 'HOUSE_OVERSIGHT_009.opt')
const textDirs = [
  path.join(publicDir, 'TEXT', '001'),
  path.join(publicDir, 'TEXT', '002')
]
const outputFile = path.join(publicDir, 'search-index.json')

console.log('Building search index...')

// Read and parse the .opt file
const optContent = fs.readFileSync(optFile, 'utf-8')
const lines = optContent.trim().split('\n')

const documents = lines.map((line, index) => {
  const parts = line.split(',')
  return {
    id: parts[0],
    source: parts[1],
    hasText: parts[3] === 'Y',
    pageCount: parts[6] ? parseInt(parts[6]) : 0,
    index: index
  }
})

console.log(`Loaded ${documents.length} documents from .opt file`)

// Create search index
const searchIndex = {
  version: '1.0',
  generated: new Date().toISOString(),
  documents: [],
  stats: {
    total: documents.length,
    withText: 0,
    indexed: 0
  }
}

// Load text content for each document
let loadedCount = 0
let errorCount = 0

for (const doc of documents) {
  if (!doc.hasText) {
    // Add document without text
    searchIndex.documents.push({
      id: doc.id,
      hasText: false,
      pageCount: doc.pageCount,
      index: doc.index
    })
    continue
  }

  searchIndex.stats.withText++

  // Try to load text from both directories
  let textContent = null
  let textFound = false

  for (const textDir of textDirs) {
    const textFile = path.join(textDir, `${doc.id}.txt`)

    if (fs.existsSync(textFile)) {
      try {
        textContent = fs.readFileSync(textFile, 'utf-8')
        textFound = true
        loadedCount++
        break
      } catch (err) {
        console.error(`Error reading ${textFile}:`, err.message)
        errorCount++
      }
    }
  }

  if (textFound && textContent) {
    // Create searchable text (lowercase for case-insensitive search)
    const searchableText = textContent.toLowerCase()

    searchIndex.documents.push({
      id: doc.id,
      hasText: true,
      pageCount: doc.pageCount,
      index: doc.index,
      text: textContent,
      searchText: searchableText,
      length: textContent.length
    })

    searchIndex.stats.indexed++
  } else {
    // Document marked as having text but file not found
    searchIndex.documents.push({
      id: doc.id,
      hasText: true,
      pageCount: doc.pageCount,
      index: doc.index,
      text: null
    })
  }

  // Progress indicator
  if ((loadedCount % 50) === 0) {
    console.log(`Processed ${loadedCount} documents...`)
  }
}

// Write the search index
console.log(`Writing search index to ${outputFile}...`)
fs.writeFileSync(outputFile, JSON.stringify(searchIndex, null, 2))

const fileSizeInMB = (fs.statSync(outputFile).size / (1024 * 1024)).toFixed(2)

console.log('\n✓ Search index built successfully!')
console.log(`  Total documents: ${searchIndex.stats.total}`)
console.log(`  Documents with text: ${searchIndex.stats.withText}`)
console.log(`  Successfully indexed: ${searchIndex.stats.indexed}`)
console.log(`  Errors: ${errorCount}`)
console.log(`  Index file size: ${fileSizeInMB} MB`)
console.log(`  Output: ${outputFile}`)
