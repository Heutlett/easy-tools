import { createContext, useContext, useEffect, useRef } from 'react'
import type { Group } from '../classrooms'
import { getDurable, setDurable, useDurable } from '../durable'

/**
 * RANKING de los juegos. No tiene nada que ver con los «Puntos» (esos los da la persona a mano):
 * el ranking se llena solo, cuando se termina una partida, y SOLO con estudiantes que estén en un grupo guardado
 * (los equipos con nombre inventado no entran).
 */
export interface RankingEntry {
  studentId: string
  /** Nombre en ese momento (por si después se borra de la lista) */
  name: string
  score: number
  /** Puesto en esa partida: 1 es el que más puntos hizo (los empates comparten puesto) */
  place: number
}

export interface RankingSession {
  id: string
  /** Cuándo terminó la partida (milisegundos) */
  at: number
  game: string
  gameTitle: string
  groupId: string
  entries: RankingEntry[]
}

export interface RankingData {
  sessions: RankingSession[]
}

const KEY = 'ranking'
/** Se guardan las últimas partidas; más que esto ya no aporta y solo hace pesado el archivo */
const MAX_SESSIONS = 4000

/** Qué juego está abierto (lo pone la pantalla de Juegos); fuera de los juegos no se registra nada */
export interface GameInfo {
  id: string
  title: string
}
export const GameInfoContext = createContext<GameInfo | null>(null)

/** Los juegos cuyo puntaje no son «puntos» sino otra unidad */
export const SCORE_UNITS: Record<string, string> = { millonario: '₡' }

export const formatScore = (game: string | null, n: number): string => {
  const unit = game ? SCORE_UNITS[game] : undefined
  const text = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return unit ? `${unit}${text}` : text
}

/** Guarda el resultado de una partida. Solo cuentan quienes estén en un grupo guardado; devuelve cuántos se guardaron. */
export function recordSession(game: GameInfo, results: { id: string; score: number }[]): number {
  const groups = getDurable<{ groups: Group[] }>('classrooms', { groups: [] }).groups
  const owner = new Map<string, { group: string; name: string }>()
  for (const g of groups) for (const s of g.students) owner.set(s.id, { group: g.id, name: s.name })

  const byGroup = new Map<string, { studentId: string; name: string; score: number }[]>()
  for (const r of results) {
    const who = owner.get(r.id)
    if (!who || !Number.isFinite(r.score)) continue
    const list = byGroup.get(who.group) ?? []
    list.push({ studentId: r.id, name: who.name, score: Math.max(0, r.score) })
    byGroup.set(who.group, list)
  }

  const fresh: RankingSession[] = []
  let saved = 0
  for (const [groupId, list] of byGroup) {
    // Si nadie hizo puntos, la partida no se cuenta (por ejemplo, se salieron al empezar)
    if (!list.some((e) => e.score > 0)) continue
    const sorted = [...list].sort((a, b) => b.score - a.score)
    const entries: RankingEntry[] = sorted.map((e) => ({
      ...e,
      place: sorted.findIndex((x) => x.score === e.score) + 1
    }))
    fresh.push({
      id: crypto.randomUUID(),
      at: Date.now(),
      game: game.id,
      gameTitle: game.title,
      groupId,
      entries
    })
    saved += entries.length
  }
  if (fresh.length)
    setDurable<RankingData>(KEY, (prev) => ({
      sessions: [...(prev?.sessions ?? []), ...fresh].slice(-MAX_SESSIONS)
    }))
  return saved
}

/** El ranking guardado */
export const useRankingData = (): [RankingData, (v: RankingData) => void] =>
  useDurable<RankingData>(KEY, { sessions: [] })

/**
 * Para los juegos que no usan `useScores`: devuelve una función para guardar el resultado de la partida actual.
 * Solo hace algo si el juego se abrió desde «Juegos».
 */
export function useRecordSession(): (results: { id: string; score: number }[]) => void {
  const game = useContext(GameInfoContext)
  const ref = useRef(game)
  useEffect(() => {
    ref.current = game
  })
  return (results) => {
    if (ref.current) recordSession(ref.current, results)
  }
}

export interface StudentSummary {
  studentId: string
  played: number
  wins: number
  best: number
  total: number
}

/** Resumen por estudiante de un grupo, para un juego (o para todos si `game` es null) */
export function summarize(
  sessions: RankingSession[],
  groupId: string,
  game: string | null
): Map<string, StudentSummary> {
  const out = new Map<string, StudentSummary>()
  for (const s of sessions) {
    if (s.groupId !== groupId || (game && s.game !== game)) continue
    // En «todos los juegos» no se suman colones con puntos: esas partidas cuentan solo como partidas y victorias
    const countsScore = game !== null || !SCORE_UNITS[s.game]
    for (const e of s.entries) {
      const row = out.get(e.studentId) ?? {
        studentId: e.studentId,
        played: 0,
        wins: 0,
        best: 0,
        total: 0
      }
      row.played += 1
      if (countsScore) {
        row.total += e.score
        row.best = Math.max(row.best, e.score)
      }
      // Gana quien queda primero con puntos, y solo si jugaron al menos dos
      if (e.place === 1 && e.score > 0 && s.entries.length > 1) row.wins += 1
      out.set(e.studentId, row)
    }
  }
  return out
}

/** Los juegos que tienen partidas guardadas en un grupo, con cuántas */
export function gamesWithResults(
  sessions: RankingSession[],
  groupId: string
): { id: string; title: string; count: number }[] {
  const map = new Map<string, { id: string; title: string; count: number }>()
  for (const s of sessions) {
    if (s.groupId !== groupId) continue
    const row = map.get(s.game) ?? { id: s.game, title: s.gameTitle, count: 0 }
    row.count += 1
    map.set(s.game, row)
  }
  return [...map.values()].sort((a, b) => a.title.localeCompare(b.title, 'es'))
}
