from playwright.sync_api import sync_playwright
import time
import sys
import io

# Set UTF-8 encoding for console output
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    print("=" * 60)
    print("Testing eFootball Players Implementation")
    print("=" * 60)

    # Test 1: Check admin panel for eFootball Players collection
    print("\n[Test 1] Navigating to Payload admin panel...")
    page.goto('http://localhost:3000/admin')
    page.wait_for_load_state('networkidle')
    time.sleep(2)  # Give time for admin to fully load

    # Take screenshot of admin
    page.screenshot(path='c:/Users/adeko/OneDrive/Desktop/codes/striker-app/admin_screenshot.png', full_page=True)
    print("✓ Admin panel loaded, screenshot saved to admin_screenshot.png")

    # Check if we can find eFootball Players collection link
    content = page.content()
    if 'efootball-players' in content.lower() or 'eFootball Players' in content or 'efootball data' in content.lower():
        print("✓ eFootball Players collection found in admin panel")
    else:
        print("⚠ eFootball Players collection not immediately visible")
        print("  (May require login or collection may be in a collapsed group)")

    # List all links with "efootball" or "player"
    links = page.locator('a').all()
    efootball_links = []
    for link in links:
        try:
            text = link.inner_text()
            href = link.get_attribute('href') or ''
            if 'efootball' in text.lower() or 'player' in text.lower() or 'efootball' in href.lower():
                efootball_links.append(f"  - {text} → {href}")
        except:
            continue

    if efootball_links:
        print("\nFound eFootball/Player related links:")
        for link in efootball_links[:10]:  # Show first 10
            print(link)

    # Test 2: Check frontend players page
    print("\n[Test 2] Navigating to frontend players page...")
    page.goto('http://localhost:3000/efootball/players')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    # Take screenshot of players page
    page.screenshot(path='c:/Users/adeko/OneDrive/Desktop/codes/striker-app/players_page_screenshot.png', full_page=True)
    print("✓ Players page loaded, screenshot saved to players_page_screenshot.png")

    # Check page content
    content = page.content()
    h1 = page.locator('h1').first
    try:
        heading = h1.inner_text()
        print(f"✓ Page heading: '{heading}'")
    except:
        print("⚠ No H1 heading found")

    # Check for filters section
    if 'filters' in content.lower():
        print("✓ Filters section found on page")

    # Check for expected elements
    expected_elements = [
        ('Position filter', 'select[name="position"]'),
        ('Min Rating filter', 'select[name="minRating"]'),
        ('Playstyle filter', 'select[name="playstyle"]'),
        ('Nationality input', 'input[name="nationality"]'),
        ('Club input', 'input[name="club"]'),
        ('Apply Filters button', 'button[type="submit"]'),
    ]

    print("\nChecking for expected filter elements:")
    for name, selector in expected_elements:
        try:
            element = page.locator(selector).first
            if element.is_visible():
                print(f"  ✓ {name} found")
            else:
                print(f"  ⚠ {name} exists but not visible")
        except:
            print(f"  ✗ {name} not found")

    # Check if there's a "no players" message (expected for empty database)
    if 'no players' in content.lower():
        print("\n✓ Empty state message displayed (expected - no players created yet)")
    else:
        # Check if there are player cards
        player_cards = page.locator('a[href*="/efootball/players/"]').all()
        if player_cards:
            print(f"\n✓ Found {len(player_cards)} player cards")
        else:
            print("\n⚠ No player cards found (database may be empty)")

    # Test 3: Try to access a non-existent player page (should show 404 or error)
    print("\n[Test 3] Testing individual player page routing...")
    page.goto('http://localhost:3000/efootball/players/test-player')
    page.wait_for_load_state('networkidle')
    time.sleep(1)

    content = page.content()
    if '404' in content or 'not found' in content.lower():
        print("✓ Non-existent player shows appropriate error page")
    else:
        print("⚠ Non-existent player page behavior unclear")

    page.screenshot(path='c:/Users/adeko/OneDrive/Desktop/codes/striker-app/player_detail_screenshot.png', full_page=True)
    print("✓ Player detail page screenshot saved to player_detail_screenshot.png")

    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Check screenshots to verify UI rendering")
    print("2. Access admin panel to create test players")
    print("3. Navigate to /admin/collections/efootball-players")
    print("=" * 60)

    browser.close()
