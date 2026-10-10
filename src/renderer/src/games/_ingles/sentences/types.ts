/** [tema, oración, traducción al español, palabra que se quita en «Fill the blank», distractores…] */
export type Row = [topic: string, en: string, es: string, ...fill: string[]]
