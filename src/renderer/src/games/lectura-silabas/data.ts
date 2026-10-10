import type { Grade } from '../../content/types'

/**
 * Palabras con su dibujo (emoji) y sus sílabas separadas con guion.
 * Los niveles siguen el orden en que se enseñan las sílabas en el primer ciclo (programa de Español del MEP):
 * directas, con todas las consonantes, inversas, mixtas, trabadas y diptongos.
 * Todos los emojis son de la versión 12 de Unicode o anteriores, para que se vean en cualquier computadora.
 */
export type LevelId = 'simples' | 'todas' | 'inversas' | 'mixtas' | 'trabadas' | 'diptongos'

export interface Level {
  id: LevelId
  title: string
  /** Ejemplo corto de lo que trabaja el nivel */
  example: string
  /** Grado en el que se suele trabajar */
  grade: Grade
}

export const LEVELS: Level[] = [
  { id: 'simples', title: 'Directas', example: 'ma · pa · sa · lu', grade: 1 },
  { id: 'todas', title: 'Todas las letras', example: 'ba · ca · ra · ña · lla', grade: 1 },
  { id: 'inversas', title: 'Inversas', example: 'al · es · ar · is', grade: 2 },
  { id: 'mixtas', title: 'Mixtas', example: 'pan · sol · tor · lón', grade: 2 },
  { id: 'trabadas', title: 'Trabadas', example: 'bra · tri · gla · pre', grade: 3 },
  { id: 'diptongos', title: 'Diptongos', example: 'ia · ue · au · io', grade: 3 }
]

export interface Word {
  emoji: string
  /** Sílabas */
  syl: string[]
  level: LevelId
}

type Row = [emoji: string, word: string]

const SIMPLES: Row[] = [
  ['🗺️', 'ma-pa'],
  ['🛵', 'mo-to'],
  ['🌊', 'o-la'],
  ['🐻', 'o-so'],
  ['🌽', 'e-lo-te'],
  ['🍲', 'so-pa'],
  ['🐸', 'sa-po'],
  ['🌙', 'lu-na'],
  ['🐒', 'mo-no'],
  ['🏀', 'pe-lo-ta'],
  ['🍅', 'to-ma-te'],
  ['🥔', 'pa-pa'],
  ['🦆', 'pa-to'],
  ['👆', 'de-do'],
  ['🔍', 'lu-pa'],
  ['🌲', 'pi-no'],
  ['👩', 'ma-má'],
  ['👨', 'pa-pá'],
  ['🥫', 'la-ta'],
  ['🕊️', 'pa-lo-ma'],
  ['🐾', 'pa-ta'],
  ['🎲', 'da-do'],
  ['🥜', 'ma-ní'],
  ['🔋', 'pi-la'],
  ['📝', 'no-ta'],
  ['🖐️', 'ma-no'],
  ['👣', 'pi-sa-da'],
  ['➕', 'su-ma']
]

const TODAS: Row[] = [
  ['🍌', 'ba-na-na'],
  ['🏠', 'ca-sa'],
  ['🐱', 'ga-to'],
  ['🐕', 'pe-rro'],
  ['🐮', 'va-ca'],
  ['🍐', 'pe-ra'],
  ['🍍', 'pi-ña'],
  ['🛏️', 'ca-ma'],
  ['🚗', 'ca-rro'],
  ['🐴', 'ca-ba-llo'],
  ['🐔', 'ga-lli-na'],
  ['🐓', 'ga-llo'],
  ['🐤', 'po-lli-to'],
  ['🐰', 'co-ne-jo'],
  ['🦒', 'ji-ra-fa'],
  ['🦊', 'zo-rro'],
  ['🐑', 'o-ve-ja'],
  ['🐝', 'a-be-ja'],
  ['🦋', 'ma-ri-po-sa'],
  ['🐞', 'ma-ri-qui-ta'],
  ['🕷️', 'a-ra-ña'],
  ['🦜', 'lo-ro'],
  ['🦉', 'bú-ho'],
  ['🦅', 'á-gui-la'],
  ['🍇', 'u-va'],
  ['🍒', 'ce-re-za'],
  ['🧀', 'que-so'],
  ['🍫', 'cho-co-la-te'],
  ['🍬', 'ca-ra-me-lo'],
  ['🍪', 'ga-lle-ta'],
  ['🍦', 'he-la-do'],
  ['🧃', 'ju-go'],
  ['🥛', 'le-che'],
  ['🚀', 'co-he-te'],
  ['⛵', 've-le-ro'],
  ['🌹', 'ro-sa'],
  ['🍃', 'ho-ja'],
  ['☁️', 'nu-be'],
  ['👕', 'ca-mi-se-ta'],
  ['👞', 'za-pa-to'],
  ['🧢', 'go-rra'],
  ['🎒', 'mo-chi-la'],
  ['🔑', 'lla-ve'],
  ['🪑', 'si-lla'],
  ['🛋️', 'so-fá'],
  ['🛁', 'ba-ñe-ra'],
  ['🚿', 'du-cha'],
  ['🥄', 'cu-cha-ra'],
  ['🪁', 'co-me-ta'],
  ['🎁', 're-ga-lo'],
  ['🎸', 'gui-ta-rra'],
  ['📷', 'cá-ma-ra'],
  ['💰', 'di-ne-ro'],
  ['👑', 'co-ro-na'],
  ['👂', 'o-re-ja'],
  ['👄', 'bo-ca'],
  ['🦥', 'pe-re-zo-so'],
  ['☕', 'ca-fé'],
  ['🐳', 'ba-lle-na'],
  ['🛶', 'ca-no-a'],
  ['📞', 'te-lé-fo-no'],
  ['🐛', 'gu-sa-no'],
  ['🕯️', 've-la'],
  ['🐺', 'lo-bo'],
  ['💍', 'a-ni-llo']
]

const INVERSAS: Row[] = [
  ['🧹', 'es-co-ba'],
  ['🏝️', 'is-la'],
  ['🎨', 'ar-te'],
  ['🔤', 'al-fa-be-to'],
  ['🧝', 'el-fo'],
  ['🐿️', 'ar-di-lla'],
  ['🥗', 'en-sa-la-da'],
  ['🍝', 'es-pa-gue-ti']
]

const MIXTAS: Row[] = [
  ['🍎', 'man-za-na'],
  ['🥭', 'man-go'],
  ['🍋', 'li-món'],
  ['🍈', 'me-lón'],
  ['🍚', 'a-rroz'],
  ['🎂', 'tor-ta'],
  ['🍰', 'pas-tel'],
  ['🐢', 'tor-tu-ga'],
  ['🐜', 'hor-mi-ga'],
  ['🐷', 'chan-cho'],
  ['🐘', 'e-le-fan-te'],
  ['🐌', 'ca-ra-col'],
  ['🐙', 'pul-po'],
  ['🦈', 'ti-bu-rón'],
  ['🌳', 'ár-bol'],
  ['🌻', 'gi-ra-sol'],
  ['🌋', 'vol-cán'],
  ['⛰️', 'mon-ta-ña'],
  ['🌴', 'pal-me-ra'],
  ['🌵', 'cac-to'],
  ['✉️', 'car-ta'],
  ['🔔', 'cam-pa-na'],
  ['✏️', 'lá-piz'],
  ['✂️', 'ti-je-ras'],
  ['👖', 'pan-ta-lón'],
  ['🥁', 'tam-bor'],
  ['🔦', 'lin-ter-na'],
  ['📱', 'ce-lu-lar'],
  ['🚢', 'bar-co'],
  ['🏰', 'cas-ti-llo'],
  ['⚽', 'ba-lón'],
  ['🔨', 'mar-ti-llo'],
  ['🧼', 'ja-bón'],
  ['🧦', 'cal-ce-tín'],
  ['🧣', 'bu-fan-da'],
  ['👔', 'cor-ba-ta'],
  ['🍄', 'hon-go'],
  ['🌰', 'cas-ta-ña'],
  ['🌷', 'tu-li-pán'],
  ['🌼', 'mar-ga-ri-ta'],
  ['🧑‍🌾', 'cam-pe-si-no'],
  ['🧑‍🚒', 'bom-be-ro'],
  ['🐬', 'del-fín'],
  ['⏰', 're-loj'],
  ['🐭', 'ra-tón']
]

const TRABADAS: Row[] = [
  ['🍓', 'fre-sa'],
  ['🐍', 'cu-le-bra'],
  ['📕', 'li-bro'],
  ['🍽️', 'pla-to'],
  ['🎈', 'glo-bo'],
  ['⭐', 'es-tre-lla'],
  ['🚜', 'trac-tor'],
  ['🎺', 'trom-pe-ta'],
  ['🦀', 'can-gre-jo'],
  ['🐉', 'dra-gón'],
  ['🐅', 'ti-gre'],
  ['🎩', 'som-bre-ro'],
  ['🧱', 'la-dri-llo'],
  ['📏', 're-gla'],
  ['🖍️', 'cra-yón'],
  ['🖊️', 'bo-lí-gra-fo'],
  ['🪐', 'pla-ne-ta'],
  ['🌾', 'tri-go'],
  ['🚲', 'bi-ci-cle-ta'],
  ['🥦', 'bró-co-li'],
  ['🍀', 'tré-bol'],
  ['♟️', 'a-je-drez'],
  ['💪', 'bra-zo'],
  ['🏖️', 'pla-ya'],
  ['🐊', 'co-co-dri-lo'],
  ['🐐', 'ca-bra'],
  ['🦓', 'ce-bra'],
  ['🧥', 'a-bri-go'],
  ['🦩', 'fla-men-co'],
  ['🏆', 'tro-fe-o'],
  ['🥶', 'frí-o']
]

const DIPTONGOS: Row[] = [
  ['🌉', 'puen-te'],
  ['⛲', 'fuen-te'],
  ['🥚', 'hue-vo'],
  ['🔥', 'fue-go'],
  ['💨', 'vien-to'],
  ['🦷', 'mue-la'],
  ['🧊', 'hie-lo'],
  ['🌧️', 'llu-via'],
  ['🚌', 'au-to-bús'],
  ['🚚', 'ca-mión'],
  ['✈️', 'a-vión'],
  ['🏫', 'es-cue-la'],
  ['📓', 'cua-der-no'],
  ['🖼️', 'cua-dro'],
  ['📺', 'te-le-vi-sión'],
  ['🎹', 'pia-no'],
  ['🎻', 'vio-lín'],
  ['🦇', 'mur-cié-la-go'],
  ['🥕', 'za-na-ho-ria'],
  ['🎉', 'fies-ta'],
  ['👴', 'a-bue-lo'],
  ['👵', 'a-bue-la'],
  ['👨‍👩‍👧', 'fa-mi-lia'],
  ['🏢', 'e-di-fi-cio'],
  ['⛪', 'i-gle-sia'],
  ['🏪', 'tien-da'],
  ['🧑‍🚀', 'as-tro-nau-ta'],
  ['🧑‍🔬', 'cien-tí-fi-co'],
  ['🔭', 'te-les-co-pio'],
  ['🔬', 'mi-cros-co-pio'],
  ['📅', 'ca-len-da-rio'],
  ['🗽', 'es-ta-tua'],
  ['🏟️', 'es-ta-dio'],
  ['🚉', 'es-ta-ción'],
  ['🏊', 'na-ta-ción'],
  ['💃', 'bai-la-ri-na'],
  ['📖', 'cuen-to'],
  ['👍', 'bue-no'],
  ['🏙️', 'ciu-dad'],
  ['❄️', 'nie-ve'],
  ['🚪', 'puer-ta'],
  ['🦵', 'pier-na'],
  ['💎', 'dia-man-te'],
  ['🎧', 'au-dí-fo-nos'],
  ['💧', 'a-gua'],
  ['🦎', 'i-gua-na'],
  ['🥑', 'a-gua-ca-te'],
  ['👸', 'rei-na']
]

const build = (level: LevelId, rows: Row[]): Word[] =>
  rows.map(([emoji, word]) => ({ emoji, syl: word.split('-'), level }))

export const WORDS: Word[] = [
  ...build('simples', SIMPLES),
  ...build('todas', TODAS),
  ...build('inversas', INVERSAS),
  ...build('mixtas', MIXTAS),
  ...build('trabadas', TRABADAS),
  ...build('diptongos', DIPTONGOS)
]

/** Palabras de una sola sílaba: solo se usan en «¿Cuántas sílabas tiene?» */
export const MONOSILABAS: Word[] = (
  [
    ['☀️', 'sol'],
    ['🍞', 'pan'],
    ['🌸', 'flor'],
    ['🚂', 'tren'],
    ['🐟', 'pez'],
    ['💡', 'luz'],
    ['🧂', 'sal'],
    ['🍯', 'miel'],
    ['🦶', 'pie'],
    ['🌊', 'mar'],
    ['🥅', 'gol'],
    ['2️⃣', 'dos'],
    ['3️⃣', 'tres']
  ] as Row[]
).map(([emoji, word]) => ({ emoji, syl: [word], level: 'simples' as LevelId }))

/** Palabras con más sílabas, para el modo de palmadas */
export const LARGAS: Word[] = (
  [
    ['🚁', 'he-li-cóp-te-ro'],
    ['🏍️', 'mo-to-ci-cle-ta'],
    ['🦛', 'hi-po-pó-ta-mo']
  ] as Row[]
).map(([emoji, word]) => ({ emoji, syl: word.split('-'), level: 'trabadas' as LevelId }))

export const wordText = (w: Word): string => w.syl.join('')
