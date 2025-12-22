# Team Testing Guide: Phase 5 - Map Feature

## Quick Start

```bash
cd ~/Developer/Bloghead/frontend
npm run dev
# Open http://localhost:5173/artists
```

## Test Scenarios

### 1. View Toggle
- [ ] Go to `/artists` page
- [ ] Click the map icon to switch to map view
- [ ] Verify map loads with artist markers
- [ ] Click grid icon to switch back
- [ ] Verify smooth transition animation

### 2. Map Markers
- [ ] Verify different colored markers appear:
  - Purple = DJ
  - Red = Band
  - Pink = Singer
  - Green = Fotograf
  - Blue = Videograf
- [ ] Hover over markers to see category emoji

### 3. Popup Cards
- [ ] Click on any marker
- [ ] Verify glassmorphism popup appears (no arrow/tip)
- [ ] Check artist photo, name, genre, location
- [ ] Click "Profil ansehen" button
- [ ] Verify navigation to artist profile page

### 4. User Location
- [ ] Click the location/crosshair button (bottom right)
- [ ] Allow browser location permission
- [ ] Verify map centers on your location
- [ ] Blue circle shows your position

### 5. Mobile Testing
- [ ] Open on mobile device or Chrome DevTools mobile
- [ ] Verify map is full width
- [ ] Test pinch zoom
- [ ] Test marker tap (should open popup)

## Known Issues

1. **Location permission**: Must allow in browser
2. **First load**: May take 1-2s for tiles to load
3. **Safari**: Requires HTTPS for geolocation

## Demo Artists to Find

| Artist | City | Look for |
|--------|------|----------|
| DJ Electra | Wiesbaden | Purple marker |
| Die Mainzer Band | Mainz | Red marker |
| Sarah Sängerin | Frankfurt | Pink marker |
| PhotoPro Max | Darmstadt | Green marker |

## Report Issues

If you find bugs, note:
1. Browser + version
2. Desktop or mobile
3. Steps to reproduce
4. Screenshot if possible

Report to: [Create GitHub Issue]
