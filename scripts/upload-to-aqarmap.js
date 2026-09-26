// AqarCare → Aqarmap.com.eg Property Upload Automation
// This script opens a headed browser, lets you log in to Aqarmap,
// then automates filling the property listing form with your AqarCare data.

const { chromium } = require('playwright');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

// ── AqarCare property type → Aqarmap property type mapping ──
const PROPERTY_TYPE_MAP = {
  'Apartment': 'شقة',
  'House': 'منزل',
  'Villa': 'فيلا',
  'Land': 'أرض',
  'Commercial': 'محل تجاري',
  'Duplex': 'دوبلكس',
  'Studio': 'استوديو',
  'Penthouse': 'بنتهاوس',
  'Chalet': 'شاليه',
};

const LISTING_TYPE_MAP = {
  'Sale': 'بيع',
  'Rent': 'إيجار',
};

const FINISHING_MAP = {
  'Finished': 'تشطيب كامل',
  'Semi-Finished': 'نصف تشطيب',
  'Super-Lux': 'سوبر لوكس',
  'Lux': 'لوكس',
  'Core-Shell': 'على المحارة',
  'Not Finished': 'بدون تشطيب',
};

// ── Fetch properties from AqarCare API ──
async function fetchProperties(apiBaseUrl, apiKey) {
  const url = `${apiBaseUrl}/api/admin/properties?PageSize=100`;
  const headers = { 'X-Api-Key': apiKey };

  console.log(`\n📡 Fetching properties from: ${url}`);
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ Found ${data.items?.length || data.totalCount || 0} properties\n`);
  return data.items || data;
}

// ── Display property summary for selection ──
function displayProperties(properties) {
  console.log('━'.repeat(70));
  console.log('  #  │ ID  │ Type        │ Listing │ Title');
  console.log('━'.repeat(70));

  properties.forEach((p, i) => {
    const type = (p.propertyType || '?').padEnd(11);
    const listing = (p.listingType || '?').padEnd(7);
    const title = (p.title || 'Untitled').substring(0, 35);
    const price = p.price ? `${p.price.toLocaleString()} EGP` : 'N/A';
    console.log(`  ${String(i + 1).padStart(2)} │ ${String(p.id).padStart(3)} │ ${type} │ ${listing} │ ${title}`);
  });

  console.log('━'.repeat(70));
}

// ── Fill the Aqarmap listing form ──
async function fillListingForm(page, property) {
  console.log(`\n🏠 Processing: "${property.title}" (ID: ${property.id})`);

  // Navigate to the listing initialization page
  await page.goto('https://aqarmap.com.eg/ar/listing/initialize', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Wait for the page to fully load
  await page.waitForTimeout(2000);

  // Take a snapshot of what we see
  const pageTitle = await page.title();
  console.log(`  📄 Page loaded: "${pageTitle}"`);

  // ── Step 1: Select property type & listing type ──
  console.log('  📝 Step 1: Selecting property type and listing type...');

  // Try to find and click the listing type (Sale/Rent)
  const listingTypeAr = LISTING_TYPE_MAP[property.listingType] || 'بيع';
  try {
    // Look for radio buttons or clickable options for listing type
    const listingTypeSelector = `text="${listingTypeAr}"`;
    const listingTypeEl = await page.$(listingTypeSelector);
    if (listingTypeEl) {
      await listingTypeEl.click();
      console.log(`    ✓ Selected listing type: ${listingTypeAr}`);
    } else {
      console.log(`    ⚠ Could not find listing type button for: ${listingTypeAr}`);
    }
  } catch (e) {
    console.log(`    ⚠ Listing type selection: ${e.message}`);
  }

  await page.waitForTimeout(1000);

  // Try to find and click the property type
  const propertyTypeAr = PROPERTY_TYPE_MAP[property.propertyType] || 'شقة';
  try {
    const propertyTypeSelector = `text="${propertyTypeAr}"`;
    const propertyTypeEl = await page.$(propertyTypeSelector);
    if (propertyTypeEl) {
      await propertyTypeEl.click();
      console.log(`    ✓ Selected property type: ${propertyTypeAr}`);
    } else {
      console.log(`    ⚠ Could not find property type button for: ${propertyTypeAr}`);
    }
  } catch (e) {
    console.log(`    ⚠ Property type selection: ${e.message}`);
  }

  await page.waitForTimeout(1000);

  // ── Step 2: Fill location ──
  console.log('  📍 Step 2: Filling location...');
  try {
    // Try to find location/address input
    const locationInput = await page.$('input[placeholder*="موقع"], input[placeholder*="عنوان"], input[name*="location"], input[name*="address"], input[type="search"]');
    if (locationInput) {
      const address = [property.city, property.district, property.address].filter(Boolean).join('، ');
      await locationInput.fill(address);
      console.log(`    ✓ Filled location: ${address}`);
      await page.waitForTimeout(2000);

      // Try to click the first suggestion
      const suggestion = await page.$('.pac-item, .suggestion, [class*="suggestion"], [class*="result"]');
      if (suggestion) {
        await suggestion.click();
        console.log('    ✓ Selected location suggestion');
      }
    } else {
      console.log('    ⚠ Could not find location input');
    }
  } catch (e) {
    console.log(`    ⚠ Location fill: ${e.message}`);
  }

  await page.waitForTimeout(1000);

  // Look for a "next" or "continue" button
  try {
    const nextBtn = await page.$('button:has-text("التالي"), button:has-text("متابعة"), button[type="submit"]');
    if (nextBtn) {
      await nextBtn.click();
      console.log('    ✓ Clicked next/continue');
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.log(`    ⚠ Next button: ${e.message}`);
  }

  // ── Step 3: Fill property details ──
  console.log('  📐 Step 3: Filling property details...');

  // Area
  await tryFillInput(page, 'input[name*="area"], input[name*="space"], input[placeholder*="مساحة"]', property.areaSqm, 'Area');

  // Price
  await tryFillInput(page, 'input[name*="price"], input[placeholder*="سعر"]', property.price, 'Price');

  // Bedrooms
  await tryFillInput(page, 'input[name*="bedroom"], input[name*="room"], select[name*="bedroom"]', property.bedrooms, 'Bedrooms');

  // Bathrooms
  await tryFillInput(page, 'input[name*="bathroom"], input[name*="bath"], select[name*="bathroom"]', property.bathrooms, 'Bathrooms');

  // Floor number
  if (property.floorNumber) {
    await tryFillInput(page, 'input[name*="floor"], select[name*="floor"]', property.floorNumber, 'Floor');
  }

  // Finishing
  const finishingAr = FINISHING_MAP[property.finishingStatus] || property.finishingStatus;
  if (finishingAr) {
    try {
      const finishingEl = await page.$(`text="${finishingAr}"`);
      if (finishingEl) {
        await finishingEl.click();
        console.log(`    ✓ Selected finishing: ${finishingAr}`);
      }
    } catch (e) {
      console.log(`    ⚠ Finishing: ${e.message}`);
    }
  }

  // ── Step 4: Fill description ──
  console.log('  📝 Step 4: Filling title and description...');
  await tryFillInput(page, 'input[name*="title"], input[placeholder*="عنوان الإعلان"]', property.title, 'Title');
  await tryFillInput(page, 'textarea[name*="description"], textarea[placeholder*="وصف"]', property.description, 'Description');

  await page.waitForTimeout(1000);

  console.log('\n  ✅ Form filling complete!');
  console.log('  ⚠️  Please review the form in the browser, upload images manually, and submit.');
}

// ── Helper: try to fill an input field ──
async function tryFillInput(page, selector, value, label) {
  if (value === null || value === undefined) return;

  try {
    const el = await page.$(selector);
    if (el) {
      const tagName = await el.evaluate((e) => e.tagName.toLowerCase());
      if (tagName === 'select') {
        await el.selectOption({ label: String(value) }).catch(() =>
          el.selectOption({ value: String(value) })
        );
      } else {
        await el.fill(String(value));
      }
      console.log(`    ✓ Filled ${label}: ${value}`);
    } else {
      console.log(`    ⚠ Could not find ${label} input (${selector})`);
    }
  } catch (e) {
    console.log(`    ⚠ ${label}: ${e.message}`);
  }
}

// ── Main ──
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   AqarCare → Aqarmap.com.eg Property Uploader      ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Get API configuration
  const apiBaseUrl = await ask('🌐 AqarCare API URL (default: https://aqarcare.runasp.net): ') || 'https://aqarcare.runasp.net';
  const apiKey = await ask('🔑 AqarCare API Key (X-Api-Key): ');

  if (!apiKey) {
    console.log('❌ API Key is required. Exiting.');
    rl.close();
    return;
  }

  // Fetch properties
  let properties;
  try {
    properties = await fetchProperties(apiBaseUrl, apiKey);
  } catch (e) {
    console.log(`❌ Failed to fetch properties: ${e.message}`);
    rl.close();
    return;
  }

  if (!properties || properties.length === 0) {
    console.log('❌ No properties found. Exiting.');
    rl.close();
    return;
  }

  // Filter only available & published properties
  const uploadable = properties.filter(
    (p) => p.status === 'Available' && p.isPublished !== false
  );
  console.log(`📋 ${uploadable.length} properties available for upload:\n`);
  displayProperties(uploadable);

  const selection = await ask('\n🔢 Enter property numbers to upload (comma-separated, or "all"): ');

  let selectedProperties;
  if (selection.trim().toLowerCase() === 'all') {
    selectedProperties = uploadable;
  } else {
    const indices = selection
      .split(',')
      .map((s) => parseInt(s.trim()) - 1)
      .filter((i) => i >= 0 && i < uploadable.length);
    selectedProperties = indices.map((i) => uploadable[i]);
  }

  if (selectedProperties.length === 0) {
    console.log('❌ No valid properties selected. Exiting.');
    rl.close();
    return;
  }

  console.log(`\n🚀 Will upload ${selectedProperties.length} properties to Aqarmap.`);

  // Launch browser
  console.log('\n🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: false,
    channel: 'msedge', // Use the user's installed Microsoft Edge
    slowMo: 300, // Slow down actions so you can watch
    args: ['--start-maximized'], // Maximize window so it's visible
  });

  const context = await browser.newContext({
    locale: 'ar-EG',
    noViewport: true, // Use the full maximized window size
  });

  const page = await context.newPage();

  // Navigate to Aqarmap login
  console.log('📱 Opening Aqarmap...');
  await page.goto('https://aqarmap.com.eg/ar/login/', { waitUntil: 'networkidle' });

  console.log('\n' + '═'.repeat(50));
  console.log('🔐 Please LOG IN to your Aqarmap account in the browser.');
  console.log('   After logging in, come back here and press Enter.');
  console.log('═'.repeat(50));
  await ask('\n⏎ Press Enter when you are logged in... ');

  // Verify login by checking if we can access the listing page
  await page.goto('https://aqarmap.com.eg/ar/listing/initialize', { waitUntil: 'networkidle' });
  const currentUrl = page.url();

  if (currentUrl.includes('login')) {
    console.log('❌ Still on login page. Please log in first.');
    await ask('⏎ Press Enter when logged in... ');
  }

  // Process each property
  for (let i = 0; i < selectedProperties.length; i++) {
    const prop = selectedProperties[i];
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  Property ${i + 1}/${selectedProperties.length}`);
    console.log(`${'═'.repeat(50)}`);

    // Fetch full details if we only have list items
    let propertyDetail = prop;
    if (!prop.description && prop.id) {
      try {
        const detailUrl = `${apiBaseUrl}/api/properties/${prop.id}`;
        const resp = await fetch(detailUrl);
        if (resp.ok) {
          propertyDetail = await resp.json();
          console.log(`  📥 Fetched full details for property #${prop.id}`);
        }
      } catch (e) {
        console.log(`  ⚠ Could not fetch details: ${e.message}`);
      }
    }

    await fillListingForm(page, propertyDetail);

    if (i < selectedProperties.length - 1) {
      console.log('\n  📸 Please upload images and submit this listing manually.');
      await ask('  ⏎ Press Enter when done to proceed to the next property... ');
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('  🎉 All properties processed!');
  console.log('  📸 Don\'t forget to upload images and submit each listing.');
  console.log('═'.repeat(50));

  await ask('\n⏎ Press Enter to close the browser... ');
  await browser.close();
  rl.close();
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  rl.close();
  process.exit(1);
});
