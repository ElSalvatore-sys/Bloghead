import { test, expect } from '@playwright/test';

test.describe('Map Popup Debug', () => {
  test('should show popup on marker hover', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    // Go to artists page
    await page.goto('https://blogyydev.xyz/artists');
    await page.waitForLoadState('networkidle');

    // Screenshot initial state
    await page.screenshot({ path: 'test-results/01-artists-page.png' });

    // Click on "Karte" toggle to switch to map view
    const karteButton = page.locator('button:has-text("Karte")');
    await karteButton.click();

    // Wait for map to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/02-map-view.png' });

    // Find all markers on the map
    const markers = page.locator('.mapboxgl-marker');
    const markerCount = await markers.count();
    console.log(`Found ${markerCount} markers on map`);

    if (markerCount > 0) {
      // Get first marker
      const firstMarker = markers.first();
      const markerBox = await firstMarker.boundingBox();
      console.log('First marker position:', markerBox);

      // Screenshot before hover
      await page.screenshot({ path: 'test-results/03-before-hover.png' });

      // Hover over the marker
      await firstMarker.hover();
      await page.waitForTimeout(500);

      // Screenshot after hover
      await page.screenshot({ path: 'test-results/04-after-hover.png' });

      // Check if popup exists
      const popup = page.locator('.mapboxgl-popup');
      const popupVisible = await popup.isVisible();
      console.log('Popup visible:', popupVisible);

      if (popupVisible) {
        const popupBox = await popup.boundingBox();
        console.log('Popup position:', popupBox);

        // Check if popup is near marker (not in top-left corner)
        if (popupBox && markerBox) {
          const distance = Math.sqrt(
            Math.pow(popupBox.x - markerBox.x, 2) +
            Math.pow(popupBox.y - markerBox.y, 2)
          );
          console.log('Distance between marker and popup:', distance);

          // Popup should be within 200px of marker
          expect(distance).toBeLessThan(200);
        }
      }

      // Screenshot with popup
      await page.screenshot({ path: 'test-results/05-popup-shown.png' });

      // Move mouse away
      await page.mouse.move(100, 100);
      await page.waitForTimeout(500);

      // Screenshot after mouse away
      await page.screenshot({ path: 'test-results/06-after-mouseout.png' });
    }
  });

  test('debug marker HTML structure', async ({ page }) => {
    await page.goto('https://blogyydev.xyz/artists');
    await page.waitForLoadState('networkidle');

    // Switch to map
    await page.locator('button:has-text("Karte")').click();
    await page.waitForTimeout(3000);

    // Get marker HTML
    const markerHTML = await page.evaluate(() => {
      const markers = document.querySelectorAll('.mapboxgl-marker');
      return Array.from(markers).map(m => ({
        html: m.outerHTML.substring(0, 500),
        style: m.getAttribute('style'),
        children: m.children.length
      }));
    });

    console.log('Markers found:', JSON.stringify(markerHTML, null, 2));

    // Get map container info
    const mapInfo = await page.evaluate(() => {
      const map = document.querySelector('.mapboxgl-map');
      return {
        width: map?.clientWidth,
        height: map?.clientHeight,
        hasCanvas: !!map?.querySelector('canvas')
      };
    });

    console.log('Map info:', mapInfo);
  });

  test('test popup mouseover issue', async ({ page }) => {
    page.on('console', msg => console.log('BROWSER:', msg.text()));

    await page.goto('https://blogyydev.xyz/artists');
    await page.waitForLoadState('networkidle');

    // Switch to map
    await page.locator('button:has-text("Karte")').click();
    await page.waitForTimeout(3000);

    const markers = page.locator('.mapboxgl-marker');
    const markerCount = await markers.count();

    if (markerCount > 0) {
      const firstMarker = markers.first();
      const markerBox = await firstMarker.boundingBox();

      if (markerBox) {
        // Hover precisely on marker center
        const centerX = markerBox.x + markerBox.width / 2;
        const centerY = markerBox.y + markerBox.height / 2;

        console.log(`Moving mouse to marker center: ${centerX}, ${centerY}`);
        await page.mouse.move(centerX, centerY);
        await page.waitForTimeout(300);

        // Take screenshot while hovering
        await page.screenshot({ path: 'test-results/07-hover-center.png' });

        // Check popup
        const popup = page.locator('.mapboxgl-popup');
        const popupCount = await popup.count();
        console.log('Popup count after hover:', popupCount);

        if (popupCount > 0) {
          const popupBox = await popup.boundingBox();
          console.log('Popup bounding box:', popupBox);

          // Check pointer-events on popup
          const pointerEvents = await page.evaluate(() => {
            const popup = document.querySelector('.mapboxgl-popup');
            return popup ? getComputedStyle(popup).pointerEvents : 'N/A';
          });
          console.log('Popup pointer-events:', pointerEvents);
        }

        // Now move mouse slightly - does popup disappear?
        await page.mouse.move(centerX + 5, centerY - 5);
        await page.waitForTimeout(200);
        await page.screenshot({ path: 'test-results/08-after-slight-move.png' });

        const popupStillVisible = await popup.isVisible();
        console.log('Popup still visible after slight move:', popupStillVisible);
      }
    }
  });
});
