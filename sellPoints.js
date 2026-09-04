// Single source of truth for all sell / pickup points.
// To add a new sell point: add one object here (id must be unique,
// used as the <option> value sent to the order backend). The pickup
// dropdown renders from this array automatically — no other file
// needs to change.
// lat/lng are kept for a possible future map view; they are not
// currently used anywhere and are unverified (approximate settlement/
// city centers) — geocode precisely before relying on them again.
const SELL_POINTS = [
  { id: 'elazar', he: 'אלעזר', en: 'Elazar', fr: 'Elazar', lat: 31.6423, lng: 35.1391 },
  { id: 'beersheva', he: 'באר שבע', en: 'Beer Sheva', fr: 'Beer Sheva', lat: 31.2530, lng: 34.7915 },
  { id: 'beitHabracha', he: 'בית הברכה (שרה חיימוב, גוש עציון)', en: 'Beit HaBracha (Sara Chaimov, Gush Etzion)', fr: 'Beit HaBracha (Sara Chaimov, Gush Etzion)', lat: 31.6520, lng: 35.1280 },
  { id: 'nofAyalon', he: 'נוף אילון', en: 'Nof Ayalon', fr: 'Nof Ayalon', lat: 31.8580, lng: 34.9330 },
  { id: 'RafaelBearSheva', he: 'רפאל שלוחת באר שבע', en: 'Rafael Beer Sheva Branch', fr: 'Rafael, succursale de Beer Sheva', lat: 31.2461, lng: 34.7997 },
  { id: 'mobileyeJerusalem', he: 'מובילאיי ירושלים', en: 'Mobileye Jerusalem', fr: 'Mobileye Jérusalem', lat: 31.7857, lng: 35.2007 },
  { id: 'rafaelJerusalem', he: 'רפאל ירושלים', en: 'Rafael Jerusalem', fr: 'Rafael Jérusalem', lat: 31.7683, lng: 35.2137 },
  { id: 'maaleHever', he: 'מעלה חבר (משפחת לוי)', en: "Ma'ale Hever (Levi Family)", fr: "Ma'ale Hever (famille Levi)", lat: 31.3891, lng: 35.0938 },
  { id: 'alonShvut', he: 'אלון שבות (דוד אורן)', en: 'Alon Shvut (David Oren)', fr: 'Alon Shvut (David Oren)', lat: 31.6553, lng: 35.1264 },
  { id: 'harBracha', he: 'הר ברכה (רבקה דסאלי)', en: 'Har Bracha (Rivka Dasali)', fr: 'Har Bracha (Rivka Dasali)', lat: 32.2020, lng: 35.2560 },
  { id: 'adeiAd', he: 'עדי עד', en: "Adei Ad", fr: "Adei Ad", lat: 32.0480, lng: 35.3170 },
  { id: 'beitGamliel', he: 'בית גמליאל (משפחת פישר)', en: 'Beit Gamliel (Fisher Family)', fr: 'Beit Gamliel (famille Fisher)', lat: 31.8267, lng: 34.7402 },
  { id: 'adurayim', he: 'אדוריים', en: 'Adurayim', fr: 'Adurayim', lat: 31.5860, lng: 34.7460 },
  { id: 'kiryatMalachi', he: 'קרית מלאכי (משפחת איראני)', en: 'Kiryat Malachi (Irani Family)', fr: 'Kiryat Malachi (famille Irani)', lat: 31.7315, lng: 34.7460 },
  { id: 'meitar', he: 'מיתר (טלי אוחיון לביא)', en: 'Meitar (Tali Ochion Lavie)', fr: 'Meitar (Tali Ochion Lavie)', lat: 31.3467, lng: 35.0333 }
];
