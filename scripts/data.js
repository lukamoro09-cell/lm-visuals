/* =====================================================================
   LM Visuals — DATA (single source of truth for facts: pricing, gallery)
   Plain global, no build step. Exposed as window.LMV.
   Edit prices / features / image lists here; the UI rebuilds itself.
   ===================================================================== */
(function () {
  'use strict';

  var EMAIL = 'lukamoro.visuals@gmail.com';

  /* Add-ons are identical across every service (DRY — defined once). */
  var ADDONS = [
    { id: 'rush',       name: 'Rush delivery',        desc: 'View your photos within 48 hours',                price: 75,   unit: 'flat'  },
    { id: 'extra-hour', name: 'Extra hour on site',   desc: 'Add another hour of coverage',                    price: 80,   unit: 'flat'  },
    { id: 'social',     name: 'Social media cuts',     desc: 'Vertical cuts for Reels / TikTok / Shorts',       price: 50,   unit: 'flat'  },
    { id: 'colour',     name: 'Colour grade upgrade',  desc: 'A hand-crafted, cinematic colour grade',          price: 55,   unit: 'flat'  },
    { id: 'travel',     name: 'Travel fee',            desc: 'For any location outside the GTA, $0.60 / km',     price: 0.60, unit: 'perKm' }
  ];

  var SERVICES = [
    {
      id: 'sports',
      name: 'Sports',
      tagline: 'Frozen motion, real intensity.',
      description: 'Game-day energy captured frame by frame, from a single athlete to a full event, finished with cinematic highlight reels.',
      tiers: [
        {
          id: 'sports-player', badge: 'Tier 1', name: 'Player Pack',
          price: 40, unit: 'hour', priceLabel: '$40', priceSuffix: '/ hour',
          summary: 'A focused session for a single athlete.',
          turnaround: '4-day turnaround', defaultHours: 1,
          features: ['50 edited photos', 'Online gallery delivery', '4-day turnaround']
        },
        {
          id: 'sports-athletic', badge: 'Tier 2', name: 'Athletic Bundle', popular: true,
          price: 100, unit: 'flat', priceLabel: '$100',
          summary: 'Stills plus a short highlight reel.',
          turnaround: '7-day turnaround',
          features: ['2-hour shoot', '70 edited photos', '60–90 second highlight reel', 'Online gallery + video file', '7-day turnaround']
        },
        {
          id: 'sports-gameday', badge: 'Tier 3', name: 'Full Game Day',
          price: 250, unit: 'flat', priceLabel: '$250',
          summary: 'Full coverage, reel, and social cuts.',
          turnaround: '10-day turnaround',
          features: ['Full event coverage (3–4 hours)', '100+ edited photos', '2–3 minute highlight reel', 'Social media cuts', 'Online gallery with all video files', '10-day turnaround']
        }
      ],
      addons: ADDONS
    },
    {
      id: 'real-estate',
      name: 'Real Estate',
      tagline: 'Listings that sell themselves.',
      description: 'Bright, true-to-life interiors and exteriors, plus walk-through film, that make a property impossible to scroll past.',
      tiers: [
        {
          id: 're-starter', badge: 'Tier 1', name: 'Starter',
          price: 179, unit: 'flat', priceLabel: '$179',
          summary: 'Condos & small units up to 800 sq ft.',
          turnaround: '2-day turnaround',
          features: ['Condo / small unit up to 800 sq ft', 'Interior & exterior photos', '20–30 edited images', '2-day turnaround']
        },
        {
          id: 're-house', badge: 'Tier 2', name: 'House Package', popular: true,
          price: 329, unit: 'flat', priceLabel: '$329',
          summary: 'Full homes up to 2,500 sq ft, with video.',
          turnaround: '4-day turnaround',
          features: ['Up to 2,500 sq ft', 'Interior & exterior photos', '40–50 edited images', '1–2 minute walk-through video', '4-day turnaround']
        },
        {
          id: 're-luxury', badge: 'Tier 3', name: 'Luxury Listing',
          price: 549, unit: 'flat', priceLabel: '$549',
          summary: 'Estates 2,500+ sq ft, cinematic & golden hour.',
          turnaround: '7-day turnaround',
          features: ['2,500+ sq ft', 'Full interior & exterior photos', '60 edited images', 'Cinematic walk-through video', 'Twilight / golden-hour shoot time', '7-day turnaround']
        }
      ],
      addons: ADDONS
    },
    {
      id: 'events',
      name: 'Events',
      tagline: 'The day, kept forever.',
      description: 'Candid, atmospheric coverage of the moments that matter, delivered as a gallery and a film you will actually rewatch.',
      tiers: [
        {
          id: 'event-starter', badge: 'Tier 1', name: 'Event Starter',
          price: 299, unit: 'flat', priceLabel: '$299',
          summary: 'Up to 3 hours of coverage.',
          turnaround: '2-week turnaround',
          features: ['Up to 3 hours', '75 edited photos', 'Online gallery delivery', '2-week turnaround']
        },
        {
          id: 'event-standard', badge: 'Tier 2', name: 'Event Standard', popular: true,
          price: 549, unit: 'flat', priceLabel: '$549',
          summary: 'Up to 5 hours, with a highlight reel.',
          turnaround: '2–3 week turnaround',
          features: ['Up to 5 hours', '120 edited photos', '2-minute highlight reel', '2–3 week turnaround']
        },
        {
          id: 'event-fullday', badge: 'Tier 3', name: 'Event Full Day',
          price: 899, unit: 'flat', priceLabel: '$899',
          summary: 'Full-day coverage and a full event film.',
          turnaround: '2–3 week turnaround',
          features: ['Full-day coverage (up to 8 hours)', '200 edited photos', '5-minute event film', '1-week sneak-peek', '2–3 week turnaround']
        }
      ],
      addons: ADDONS
    },
    {
      id: 'portraits',
      name: 'Portraits',
      tagline: 'You, at your best.',
      description: 'Clean, characterful portraits for headshots, personal branding, graduation, or just for yourself. Studio-grade light, an easy session, and a gallery ready to share.',
      tiers: [
        {
          id: 'portrait-mini', badge: 'Tier 1', name: 'Mini Session',
          price: 30, unit: 'flat', priceLabel: '$30',
          summary: 'A quick, focused sitting.',
          turnaround: '3-day turnaround',
          features: ['30-minute shoot', '5–10 edited photos', 'Online gallery delivery', '3-day turnaround']
        },
        {
          id: 'portrait-standard', badge: 'Tier 2', name: 'Standard Session', popular: true,
          price: 40, unit: 'flat', priceLabel: '$40',
          summary: 'More time, more selects.',
          turnaround: '3-day turnaround',
          features: ['45-minute shoot', '10–15 edited photos', 'Online gallery delivery', '3-day turnaround']
        },
        {
          id: 'portrait-premium', badge: 'Tier 3', name: 'Premium Session',
          price: 75, unit: 'flat', priceLabel: '$75',
          summary: 'The full sitting, more looks.',
          turnaround: '3-day turnaround',
          features: ['1-hour shoot', '20–30 edited photos', 'Online gallery delivery', '3-day turnaround']
        }
      ],
      addons: ADDONS
    }
  ];

  /* ---- Gallery -----------------------------------------------------
     Each item points at a file in /media/<category>/. Missing files
     fall back to a tasteful gradient, so the grid always looks full.
     The "size" hint drives an editorial masonry layout.
  ------------------------------------------------------------------ */
  var CATEGORIES = [
    { id: 'all',         label: 'All Work' },
    { id: 'sports',      label: 'Sports' },
    { id: 'portraits',   label: 'Portraits' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'events',      label: 'Events' }
  ];

  /* Intrinsic [width, height] of every gallery image. These let the masonry
     reserve exact space (no layout shift) and show each photo UNCROPPED at its
     true aspect ratio — portrait, landscape, or square. Regenerate if you swap
     photos (any size works; the layout adapts). */
  var DIMS = {
    'sports-01': [1800, 1200], 'sports-02': [1800, 1200], 'sports-03': [1080, 1620],
    'sports-04': [1080, 1620], 'sports-05': [1080, 1620], 'sports-06': [744, 952],
    'sports-07': [1080, 1620], 'sports-08': [1080, 1620], 'sports-09': [828, 552],
    'sports-10': [828, 560], 'sports-11': [1616, 1080],
    'sports-12': [1600, 1067], 'sports-13': [828, 1242], 'sports-14': [828, 552], 'sports-15': [828, 552],
    'portraits-01': [1370, 1800], 'portraits-02': [1524, 1800],
    'events-01': [1200, 1800], 'events-02': [1200, 1800],
    'events-03': [1306, 1800], 'events-04': [1052, 1800],
    'events-05': [1600, 751], 'events-06': [1600, 751],
    'real-estate-01': [1600, 751], 'real-estate-02': [688, 752], 'real-estate-03': [688, 752],
    'real-estate-04': [688, 752], 'real-estate-05': [688, 752], 'real-estate-06': [688, 647],
    'real-estate-07': [1600, 751], 'real-estate-08': [1408, 660],
    'real-estate-09': [1600, 751], 'real-estate-10': [1600, 751]
  };

  function prettyCategory(id) {
    if (id === 'real-estate') return 'Real Estate';
    if (id === 'portraits') return 'Portraits';
    return id.charAt(0).toUpperCase() + id.slice(1);
  }

  function buildGallery(category, count, ext) {
    ext = ext || 'jpg';
    var items = [];
    for (var i = 1; i <= count; i++) {
      var n = i < 10 ? '0' + i : '' + i;
      var key = category + '-' + n;
      var d = DIMS[key] || [4, 3];
      items.push({
        category: category,
        src: 'media/' + category + '/' + key + '.' + ext,
        alt: prettyCategory(category) + ' work by LM Visuals, frame ' + i,
        w: d[0], h: d[1]
      });
    }
    return items;
  }

  /* Interleave categories so the default "All" view feels art-directed.
     real-estate + events-05/06 are Luka's own generated photos. */
  var groups = [
    buildGallery('sports', 15),
    buildGallery('portraits', 2),
    buildGallery('real-estate', 10),
    buildGallery('events', 6)
  ];
  var GALLERY = [];
  var longest = Math.max.apply(null, groups.map(function (g) { return g.length; }));
  for (var k = 0; k < longest; k++) {
    groups.forEach(function (g) { if (g[k]) GALLERY.push(g[k]); });
  }

  /* Optional showreel. Set `embed` to a youtube-nocookie/vimeo URL, OR
     drop media/videos/showreel.mp4 and set `file`. Leave both empty to hide. */
  var REEL = {
    poster: 'media/videos/reel-poster.jpg',
    file: '',   // e.g. 'media/videos/showreel.mp4'
    embed: ''   // e.g. 'https://www.youtube-nocookie.com/embed/VIDEO_ID'
  };

  window.LMV = {
    email: EMAIL,
    // Optional: paste a Google Apps Script /exec URL here to ALSO log every
    // booking/contact submission to a Google Sheet (see README). Leave '' to
    // use email-only delivery via FormSubmit.
    sheetEndpoint: '',
    services: SERVICES,
    addons: ADDONS,
    categories: CATEGORIES,
    gallery: GALLERY,
    reel: REEL,
    prettyCategory: prettyCategory
  };
})();
