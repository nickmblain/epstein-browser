# Deployment Guide

## Before Deploying

1. **Build the search index** (if not already done):
   ```bash
   npm run build-index
   ```

2. **Test the production build locally**:
   ```bash
   npm run build
   npm run preview
   ```

## Option 1: Netlify (Recommended - Easiest)

### Method A: Drag & Drop (Fastest)
1. Build the site:
   ```bash
   npm run build
   ```
2. Go to [netlify.com](https://netlify.com) and sign up
3. Drag the `dist` folder to Netlify's deploy zone
4. Done! You'll get a URL like `https://random-name.netlify.app`

### Method B: Git Integration (Better for updates)
1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Build settings (should auto-detect from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

**Note:** The search-index.json file (113 MB) will be included automatically.

---

## Option 2: Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   npm run build
   vercel
   ```

3. Follow the prompts
4. Or connect via GitHub at [vercel.com](https://vercel.com)

---

## Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install -D gh-pages
   ```

2. Add to package.json scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```

3. Update vite.config.js:
   ```js
   export default defineConfig({
     base: '/repository-name/',
     plugins: [vue()]
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

**Note:** GitHub Pages has a 100 MB file size limit. Your search-index.json (113 MB) might be too large.

---

## Option 4: Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your Git repository
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy!

---

## Important Notes

### File Sizes
- Your `search-index.json` is **113 MB**
- Total public folder size with documents: **~200+ MB**
- When images are added, this will grow significantly

### Best Hosting for Large Files
1. **Netlify** - 100 GB bandwidth/month on free tier ✓
2. **Vercel** - 100 GB bandwidth/month on free tier ✓
3. **Cloudflare Pages** - Unlimited bandwidth ✓✓✓
4. **GitHub Pages** - 100 MB file size limit ✗ (won't work)

### Recommended: Cloudflare Pages or Netlify
Both handle large files well and have generous free tiers.

---

## After Deployment

Your site will be live at a URL like:
- Netlify: `https://your-site-name.netlify.app`
- Vercel: `https://your-site-name.vercel.app`
- Cloudflare: `https://your-site-name.pages.dev`

You can add a custom domain later if needed.

---

## Updating the Site

If you add new documents:
1. Run `npm run build-index` to rebuild the search index
2. Commit and push changes (if using Git integration)
3. Or rebuild and redeploy manually

The hosting providers with Git integration will auto-deploy on push!
