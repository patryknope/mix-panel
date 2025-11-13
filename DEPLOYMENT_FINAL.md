# Final Deployment Guide

## Critical Fix Applied

### Issue: Event handlers in Server Components
**Error**: `Event handlers cannot be passed to Client Component props`

**Root Cause**:
The match detail page (`/matches/[id]`) is a Server Component but had a Button with `onClick` handler for copying the config URL.

**Solution**:
- Created `src/components/copy-button.tsx` as a Client Component
- Extracted the copy functionality into this reusable component
- Now provides visual feedback (checkmark icon when copied)
- Properly separated server and client code

## All Files Ready

### New Files
1. `/src/app/settings/page.tsx` - User settings page
2. `/src/app/teams/[id]/edit/page.tsx` - Team editing page
3. `/src/app/api/teams/[id]/route.ts` - Team CRUD API endpoints
4. `/src/components/copy-button.tsx` - Client component for copying text
5. `/src/contexts/language-context.tsx` - Language management
6. `/LATEST_FIXES.md` - Documentation
7. `/DEPLOYMENT_FINAL.md` - This file

### Modified Files
1. `/src/app/matches/create/page.tsx` - Fixed Card onClick issue
2. `/src/app/matches/[id]/page.tsx` - Replaced Button onClick with CopyButton
3. `/src/app/teams/page.tsx` - Updated edit link
4. `/src/app/providers.tsx` - Added LanguageProvider
5. `/src/components/language-switcher.tsx` - Updated to use context
6. `/prisma/schema.prisma` - Made teams optional, added Discord webhook

## Build Status

✅ Build completed successfully
✅ All TypeScript checks passed
✅ All routes compiled

## Deployment Steps

### 1. Push to GitHub

```bash
cd /mnt/c/Users/patry/Desktop/get5panel
git push origin master
```

### 2. Deploy to Vercel

**IMPORTANT**: Force a fresh build to clear cache

```bash
# Option 1: Use Vercel CLI with force flag
npx vercel --prod --force

# Option 2: Via Vercel Dashboard
# Go to your project → Settings → General
# Scroll to "Build & Development Settings"
# Click "Redeploy" and check "Use existing Build Cache: OFF"
```

### 3. Clear Vercel Cache (if issues persist)

If you still get the onClick error after deployment:

1. Go to Vercel Dashboard
2. Navigate to your project
3. Go to Settings → General
4. Find "Clear Build Cache"
5. Click "Clear Cache"
6. Trigger a new deployment

### 4. Run Database Migrations

In phpMyAdmin, run:

```sql
-- Make teams optional for quick veto mode
ALTER TABLE `Match`
MODIFY COLUMN `team1Id` VARCHAR(191) NULL,
MODIFY COLUMN `team2Id` VARCHAR(191) NULL;

-- Add Discord webhook support
ALTER TABLE `Match`
ADD COLUMN `discordWebhook` VARCHAR(191) NULL;
```

### 5. Update Environment Variables (if needed)

Make sure these are set in Vercel:

```env
DATABASE_URL="mysql://929081:C04y02YGc7lILaC@sql.pukawka.pl:3306/929081"
NEXTAUTH_URL="https://get5panel.vercel.app"
NEXTAUTH_SECRET="your-secret-here"
STEAM_API_KEY="your-steam-api-key"
```

## Testing After Deployment

Test these in order:

### Phase 1: Basic Navigation
- [ ] Visit homepage
- [ ] Login with Steam
- [ ] Navigate to /settings (should work now)
- [ ] Toggle dark/light theme
- [ ] Switch languages (EN/PL/DE)

### Phase 2: Match Management
- [ ] Go to /matches - view all matches
- [ ] Click "Create Match" - should show mode selection
- [ ] Select "Quick Veto" - should proceed without error
- [ ] Fill veto form and create
- [ ] Select "Match with Teams" - should work
- [ ] View an existing match - copy button should work

### Phase 3: Team Management
- [ ] Go to /teams - view all teams
- [ ] Click on a team - view team detail page
- [ ] Click edit button on your team
- [ ] Edit team details and save
- [ ] Add/remove players

## Troubleshooting

### Still Getting onClick Error?

1. **Hard refresh the browser**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear browser cache and cookies**
3. **Check Vercel deployment logs** for any build errors
4. **Verify all commits were pushed**:
   ```bash
   git log --oneline -5
   ```
   Should show:
   - Fix onClick handlers in server components
   - Previous commits...

### Language Switching Not Working?

- Check browser console for import errors
- Language files are at: `src/i18n/locales/{en,pl,de}/common.json`
- Refresh page after switching language

### Match Config URL Not Copying?

- Check browser console for clipboard errors
- Some browsers require HTTPS for clipboard API
- Try on desktop browser (mobile browsers have clipboard restrictions)

### Match Not Showing as LIVE?

The panel updates match status via webhooks from your CS2 server:

1. **Verify MatchZy plugin is installed** on your CS2 server
2. **Load the match config** with:
   ```
   get5_loadmatch_url "https://get5panel.vercel.app/api/match/{matchid}/config"
   ```
3. **Check server console** for any webhook errors
4. **Verify server can reach your panel** (check firewall rules)

## Features Working After Deployment

✅ Dark theme toggle
✅ Language switching (EN/PL/DE)
✅ Quick Veto mode (matches without teams)
✅ Match with Teams mode
✅ View all matches (public)
✅ View team details
✅ Edit teams (roster management)
✅ Copy match config URL
✅ Discord webhook notifications
✅ Settings page
✅ Steam authentication with graceful API fallback

## Known Limitations

1. **Steam API Forbidden Error**:
   - Handled gracefully, auth continues with default name
   - Check if domain is registered at https://steamcommunity.com/dev/apikey

2. **Live Match Updates**:
   - Requires MatchZy webhook access
   - Server must be able to reach your Vercel deployment

3. **Language Switching**:
   - May require page refresh
   - Translations loaded dynamically

## Support

If issues persist after following all steps:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify database migrations were applied
4. Try clearing all caches (Vercel, browser, CDN)
5. Check the git commit history to ensure all changes were pushed

## Success Indicators

You'll know everything is working when:

- ✅ No "Application error" messages
- ✅ Can create Quick Veto matches
- ✅ Can create matches with teams
- ✅ Copy button shows checkmark after clicking
- ✅ Edit team page loads and saves
- ✅ Settings page shows your profile
- ✅ Language switcher changes interface text
- ✅ Theme toggle switches between light/dark

## Final Notes

- Build time: ~30-60 seconds
- All routes are optimized
- Server components where possible (better performance)
- Client components only where needed (interactivity)
- Ready for production use! 🚀

---

Last updated: After fixing onClick handlers in server components
Build status: ✅ Successful
Ready to deploy: ✅ Yes
