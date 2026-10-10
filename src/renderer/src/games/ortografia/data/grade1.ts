/*
 * Palabras de 1.º: dibujo (emoji), palabra y sílabas. El dibujo ayuda a adivinar,
 * pero la palabra siempre se ve con un pedacito tapado.
 */
export interface PictureWord {
  emoji: string
  word: string
  syllables: string[]
}

const rows = `
🐱 ga-to|🐶 pe-rro|🐸 ra-na|🐢 tor-tu-ga|🦋 ma-ri-po-sa|🐝 a-be-ja|🐌 ca-ra-col|🐘 e-le-fan-te
🐒 mo-no|🐴 ca-ba-llo|🐄 va-ca|🐷 cer-do|🐔 ga-lli-na|🦆 pa-to|🐍 ser-pien-te|🦀 can-gre-jo
🐙 pul-po|🐋 ba-lle-na|🐰 co-ne-jo|🦊 zo-rro|🐯 ti-gre|🐑 o-ve-ja|🐐 ca-bra|🦜 lo-ro
🐻 o-so|🐜 hor-mi-ga|🕷️ a-ra-ña|🌞 sol|🌙 lu-na|⭐ es-tre-lla|☁️ nu-be|🌴 pal-me-ra
🌹 ro-sa|🌻 gi-ra-sol|🔥 fue-go|💧 go-ta|🌊 o-la|⛰️ mon-ta-ña|🍃 ho-ja|🍄 hon-go
🍎 man-za-na|🍌 ba-na-no|🍇 u-vas|🍍 pi-ña|🍓 fre-sa|🥕 za-na-ho-ria|🥑 a-gua-ca-te|🥥 co-co
🍞 pan|🧀 que-so|🥚 hue-vo|🍪 ga-lle-ta|🍰 pas-tel|🍦 he-la-do|🍅 to-ma-te|🥔 pa-pa
🍊 na-ran-ja|🍐 pe-ra|🍒 ce-re-za|🥛 le-che|🍯 miel|🏠 ca-sa|🚗 ca-rro|🚲 bi-ci-cle-ta
⚽ pe-lo-ta|📖 li-bro|🔑 lla-ve|👑 co-ro-na|🎈 glo-bo|🎁 re-ga-lo|🕯️ ve-la|☂️ pa-ra-guas
👟 za-pa-to|👕 ca-mi-sa|🎩 som-bre-ro|🔔 cam-pa-na|🥁 tam-bor|🎸 gui-ta-rra|🪑 si-lla|🛏️ ca-ma
🚪 puer-ta|🪟 ven-ta-na|🥄 cu-cha-ra|🍽️ pla-to|⏰ re-loj|🪁 co-me-ta|✂️ ti-je-ras|🎺 trom-pe-ta
⛵ bar-co|👂 o-re-ja|👁️ o-jo|👃 na-riz|👄 bo-ca|✋ ma-no|🦷 dien-te|🚌 bus|🌵 cac-tus
`

export const pictureWords: PictureWord[] = rows
  .split('|')
  .flatMap((chunk) => chunk.split('\n'))
  .map((s) => s.trim())
  .filter(Boolean)
  .map((entry) => {
    const [emoji, syl] = entry.split(/\s+/)
    return { emoji, word: syl.replace(/-/g, ''), syllables: syl.split('-') }
  })
