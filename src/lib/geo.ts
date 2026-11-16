export interface Coordinates {
  latitude: number
  longitude: number
}

type LatLng = [latitude: number, longitude: number]

// `locations` in Supabase has no coordinates, so they live here. Cities with a venue get their
// own entry; anything else falls back to its province capital, which is close enough to rank
// venues by distance.
const cityCoordinates: Record<string, LatLng> = {
  madrid: [40.4168, -3.7038],
  'montcada i reixac': [41.4833, 2.1833],
  reus: [41.1561, 1.1069],
  'dos hermanas': [37.2833, -5.9208],
}

const provinceCapitalCoordinates: Record<string, LatLng> = {
  'a coruna': [43.3623, -8.4115],
  alava: [42.8467, -2.6716],
  albacete: [38.9943, -1.8585],
  alicante: [38.3452, -0.481],
  almeria: [36.834, -2.4637],
  asturias: [43.3619, -5.8494],
  avila: [40.6565, -4.6818],
  badajoz: [38.8794, -6.9707],
  baleares: [39.5696, 2.6502],
  barcelona: [41.3874, 2.1686],
  bizkaia: [43.263, -2.935],
  burgos: [42.3439, -3.6969],
  caceres: [39.4753, -6.3724],
  cadiz: [36.5271, -6.2886],
  cantabria: [43.4623, -3.81],
  castellon: [39.9864, -0.0513],
  ceuta: [35.8894, -5.3213],
  'ciudad real': [38.9848, -3.9274],
  cordoba: [37.8882, -4.7794],
  cuenca: [40.0704, -2.1374],
  gipuzkoa: [43.3183, -1.9812],
  girona: [41.9794, 2.8214],
  granada: [37.1773, -3.5986],
  guadalajara: [40.6333, -3.1667],
  huelva: [37.2614, -6.9447],
  huesca: [42.1401, -0.4089],
  jaen: [37.7796, -3.7849],
  'la rioja': [42.4627, -2.445],
  'las palmas': [28.1235, -15.4363],
  leon: [42.5987, -5.5671],
  lleida: [41.6176, 0.62],
  lugo: [43.0097, -7.5568],
  madrid: [40.4168, -3.7038],
  malaga: [36.7213, -4.4214],
  melilla: [35.2923, -2.9381],
  murcia: [37.9922, -1.1307],
  navarra: [42.8125, -1.6458],
  ourense: [42.3358, -7.8639],
  palencia: [42.0095, -4.5288],
  pontevedra: [42.431, -8.6444],
  salamanca: [40.9701, -5.6635],
  'santa cruz de tenerife': [28.4636, -16.2518],
  segovia: [40.9429, -4.1088],
  sevilla: [37.3891, -5.9845],
  soria: [41.7636, -2.4649],
  tarragona: [41.1189, 1.2445],
  teruel: [40.3457, -1.1065],
  toledo: [39.8628, -4.0273],
  valencia: [39.4699, -0.3763],
  valladolid: [41.6523, -4.7245],
  zamora: [41.5034, -5.7467],
  zaragoza: [41.6488, -0.8891],
}

// Alternative spellings (Spanish / co-official / older names) mapped to the keys above.
const provinceAliases: Record<string, string> = {
  'la coruna': 'a coruna',
  coruna: 'a coruna',
  araba: 'alava',
  'araba/alava': 'alava',
  'alava/araba': 'alava',
  alacant: 'alicante',
  'alicante/alacant': 'alicante',
  'illes balears': 'baleares',
  'islas baleares': 'baleares',
  vizcaya: 'bizkaia',
  castello: 'castellon',
  'castellon/castello': 'castellon',
  guipuzcoa: 'gipuzkoa',
  gerona: 'girona',
  lerida: 'lleida',
  orense: 'ourense',
  'valencia/valencia': 'valencia',
  rioja: 'la rioja',
  'santa cruz': 'santa cruz de tenerife',
  tenerife: 'santa cruz de tenerife',
}

function normalizePlace(value: string) {
  return value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ')
}

function toCoordinates([latitude, longitude]: LatLng): Coordinates {
  return { latitude, longitude }
}

/** Best-known coordinates for a venue's city, falling back to its province capital. */
export function coordinatesForPlace(city: string, province: string): Coordinates | null {
  const cityKey = normalizePlace(city)
  if (cityCoordinates[cityKey]) return toCoordinates(cityCoordinates[cityKey])

  const provinceKey = normalizePlace(province)
  const capital = provinceCapitalCoordinates[provinceAliases[provinceKey] ?? provinceKey]
  return capital ? toCoordinates(capital) : null
}

/** Great-circle (haversine) distance in kilometres. */
export function distanceKm(from: Coordinates, to: Coordinates) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180
  const deltaLatitude = toRadians(to.latitude - from.latitude)
  const deltaLongitude = toRadians(to.longitude - from.longitude)
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLongitude / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number) {
  if (km < 1) return '< 1 km'
  return `${Math.round(km).toLocaleString('es-ES')} km`
}
