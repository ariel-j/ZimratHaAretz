// Single source of truth for all sell / pickup points.
// To add a new sell point: add one object here (id must be unique,
// used as the <option> value sent to the order backend). The pickup
// dropdown and the interactive map both render from this array
// automatically — no other file needs to change.
// Coordinates are approximate (settlement/city center) — replace with an
// exact address geocode when available for best "near you" accuracy.
const SELL_POINTS = [
  { id: 'elazar', he: 'אלעזר', en: 'Elazar', fr: 'Elazar', lat: 31.6423, lng: 35.1391 },
  { id: 'beersheva', he: 'באר שבע', en: 'Beer Sheva', fr: 'Beer Sheva', lat: 31.2530, lng: 34.7915 },
  { id: 'beitHabracha', he: 'בית הברכה (שרה חיימוב, גוש עציון)', en: 'Beit HaBracha (Sara Chaimov, Gush Etzion)', fr: 'Beit HaBracha (Sara Chaimov, Gush Etzion)', lat: 31.6520, lng: 35.1280 },
  { id: 'nofAyalon', he: 'נוף אילון', en: 'Nof Ayalon', fr: 'Nof Ayalon', lat: 31.8580, lng: 34.9330 },
  { id: 'RafaelBearSheva', he: 'רפאל שלוחת באר שבע', en: 'Rafael Beer Sheva Branch', fr: 'Rafael, succursale de Beer Sheva', lat: 31.2461, lng: 34.7997 },
  { id: 'mobileyeJerusalem', he: 'מובילאיי ירושלים', en: 'Mobileye Jerusalem', fr: 'Mobileye Jérusalem', lat: 31.7857, lng: 35.2007 },
  { id: 'rafaelJerusalem', he: 'רפאל ירושלים', en: 'Rafael Jerusalem', fr: 'Rafael Jérusalem', lat: 31.7683, lng: 35.2137 },
  { id: 'maaleHever', he: 'מעלה חבר (משפחת לוי)', en: "Ma'ale Hever (Levi Family)", fr: "Ma'ale Hever (famille Levi)", lat: 31.3891, lng: 35.0938 },
  { id: 'raanana', he: 'רעננה (אלתרמן 8)', en: 'Raanana (Alterman 8)', fr: 'Ra\'anana (Alterman 8)', lat: 32.1848, lng: 34.8713 },
  { id: 'alonShvut', he: 'אלון שבות (דוד אורן)', en: 'Alon Shvut (David Oren)', fr: 'Alon Shvut (David Oren)', lat: 31.6553, lng: 35.1264 },
  { id: 'harBracha', he: 'הר ברכה (רבקה דסאלי)', en: 'Har Bracha (Rivka Dasali)', fr: 'Har Bracha (Rivka Dasali)', lat: 32.2020, lng: 35.2560 }
];
