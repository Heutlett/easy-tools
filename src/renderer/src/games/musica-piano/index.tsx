import './style.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { useStopAudioOnLeave } from '../_musica/hooks'
import InstrumentIcon from '../_musica/icons'
import { midiOf, pitchName, pitchOfMidi } from '../_musica/notes'
import { SONGS, playSong, songRange, type Song } from '../_musica/songs'
import { INSTRUMENT_INFO, stopAll, type InstrumentId } from '../_musica/synth'
import { AudioNotice, PillRow } from '../_musica/ui'
import { SIZES, TIMBRES, type KeyboardSize, type Labels } from './data'
import Keyboard from './Keyboard'

interface Settings {
  octaves: 1 | 2
  labels: Labels
  inst: InstrumentId
}

const DEFAULTS: Settings = { octaves: 2, labels: 'notes', inst: 'piano' }

type View = { name: 'free' } | { name: 'songs' } | { name: 'play'; song: Song; help: boolean }

/** Canciones que caben en el teclado de dos octavas (Do central a Do agudo) */
const PLAYABLE = SONGS.filter((s) => {
  const [lo, hi] = songRange(s)
  return lo >= 60 && hi <= 84
})

export default function Piano(): React.JSX.Element {
  const [saved, setSettings] = usePersistentState<Settings>('game:musica-piano:settings', DEFAULTS)
  const settings = { ...DEFAULTS, ...saved }
  const [view, setView] = useState<View>({ name: 'free' })
  const [help, setHelp] = usePersistentState('game:musica-piano:help', true)
  useStopAudioOnLeave()
  const set = (patch: Partial<Settings>): void => setSettings({ ...settings, ...patch })
  const songMode = view.name !== 'free'

  return (
    <div className="g-stage mp">
      <div className="mp-bar">
        <div className="pills" role="group" aria-label="Qué hacemos">
          <button
            className={`pill ${!songMode ? 'selected' : ''}`}
            aria-pressed={!songMode}
            onClick={() => (stopAll(), setView({ name: 'free' }))}
          >
            🎹 Tocar libre
          </button>
          <button
            className={`pill ${songMode ? 'selected' : ''}`}
            aria-pressed={songMode}
            onClick={() => (stopAll(), setView({ name: 'songs' }))}
          >
            🎶 Toca la canción
          </button>
        </div>
        <div className="pills mp-timbres" role="group" aria-label="Sonido">
          {TIMBRES.map((id) => (
            <button
              key={id}
              className={`pill ${settings.inst === id ? 'selected' : ''}`}
              aria-pressed={settings.inst === id}
              onClick={() => set({ inst: id })}
            >
              <InstrumentIcon id={id} size={1.3} /> {INSTRUMENT_INFO[id].name}
            </button>
          ))}
        </div>
      </div>
      <AudioNotice />

      {view.name === 'free' && <FreePlay settings={settings} set={set} />}

      {view.name === 'songs' && (
        <section className="panel mp-songs">
          <PillRow
            label="Ayuda"
            value={help ? 'help' : 'none'}
            onChange={(v) => setHelp(v === 'help')}
            options={[
              { value: 'help', label: '💡 Con la tecla marcada' },
              { value: 'none', label: 'Solo los nombres' }
            ]}
          />
          <span className="panel-title">Elige una canción</span>
          <div className="mp-song-grid">
            {PLAYABLE.map((s) => (
              <button
                key={s.id}
                className="list-card mp-song"
                onClick={() => setView({ name: 'play', song: s, help })}
              >
                <span className="mp-song-emoji" aria-hidden>
                  {s.emoji}
                </span>
                <strong>{s.title}</strong>
                <span className="muted">{s.notes.filter((n) => n.pitch).length} notas</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {view.name === 'play' && (
        <SongPlay
          key={view.song.id + String(view.help)}
          song={view.song}
          help={view.help}
          settings={settings}
          onBack={() => (stopAll(), setView({ name: 'songs' }))}
        />
      )}
    </div>
  )
}

function FreePlay({
  settings,
  set
}: {
  settings: Settings
  set: (patch: Partial<Settings>) => void
}): React.JSX.Element {
  const [last, setLast] = useState<number | null>(null)
  const pitch = last === null ? null : pitchOfMidi(last)
  return (
    <>
      <div className="mp-options">
        <div className="pills" role="group" aria-label="Octavas">
          {([1, 2] as const).map((n) => (
            <button
              key={n}
              className={`pill ${settings.octaves === n ? 'selected' : ''}`}
              aria-pressed={settings.octaves === n}
              onClick={() => set({ octaves: n })}
            >
              {n === 1 ? '1 octava' : '2 octavas'}
            </button>
          ))}
        </div>
        <div className="pills" role="group" aria-label="Rótulos de las teclas">
          {(
            [
              ['notes', '🔤 Nombres de las notas'],
              ['keys', '⌨️ Teclas de la computadora'],
              ['none', 'Sin letras']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`pill ${settings.labels === id ? 'selected' : ''}`}
              aria-pressed={settings.labels === id}
              onClick={() => set({ labels: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mp-now" aria-live="polite">
        {pitch ? (
          <span className="mp-now-name">{pitchName(pitch)}</span>
        ) : (
          <span className="muted">Toca una tecla</span>
        )}
      </div>
      <Keyboard
        size={SIZES[settings.octaves]}
        inst={settings.inst}
        labels={settings.labels}
        onPlay={setLast}
      />
      <p className="muted mp-hint">
        Con el mouse (también arrastrando) o con el teclado de la computadora
      </p>
    </>
  )
}

function SongPlay({
  song,
  help,
  settings,
  onBack
}: {
  song: Song
  help: boolean
  settings: Settings
  onBack: () => void
}): React.JSX.Element {
  const expected = useMemo(
    () => song.notes.filter((n) => n.pitch).map((n) => midiOf(n.pitch!)),
    [song]
  )
  const size: KeyboardSize = Math.max(...expected) <= 72 ? SIZES[1] : SIZES[2]
  const [index, setIndex] = useState(0)
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [flash, setFlash] = useState<{ midi: number; ok: boolean; n: number } | undefined>()
  const [lit, setLit] = useState<number[]>([])
  const [demo, setDemo] = useState(false)
  const timers = useRef<number[]>([])
  const done = index >= expected.length

  const clearTimers = (): void => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const listen = (): void => {
    stopAll()
    clearTimers()
    const { duration, starts } = playSong(song, { inst: settings.inst })
    setDemo(true)
    starts.forEach((at, i) => {
      timers.current.push(window.setTimeout(() => setLit([expected[i]]), 80 + at * 1000))
      timers.current.push(window.setTimeout(() => setLit([]), 80 + at * 1000 + 220))
    })
    timers.current.push(
      window.setTimeout(
        () => {
          setDemo(false)
          setLit([])
        },
        250 + duration * 1000
      )
    )
  }

  const restart = (): void => {
    stopAll()
    clearTimers()
    setIndex(0)
    setHits(0)
    setMisses(0)
    setFlash(undefined)
    setLit([])
    setDemo(false)
  }

  const onPlay = (midi: number): void => {
    if (done || demo) return
    const ok = midi === expected[index]
    setFlash({ midi, ok, n: (flash?.n ?? 0) + 1 })
    if (ok) {
      setHits(hits + 1)
      setIndex(index + 1)
      if (index + 1 >= expected.length) setTimeout(() => sfx.win(), 500)
    } else setMisses(misses + 1)
  }

  const accuracy = hits + misses === 0 ? 1 : hits / (hits + misses)
  const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1
  const chips = expected.slice(Math.max(0, index - 2), index + 10)
  const first = Math.max(0, index - 2)

  return (
    <>
      <div className="mp-song-head">
        <span className="g-badge">
          {song.emoji} {song.title}
        </span>
        <span className="g-badge">
          ✅ {hits} · ❌ {misses}
        </span>
        <span className="mp-spacer" />
        <button className="btn secondary small" onClick={listen} disabled={demo}>
          🎧 Escuchar la canción
        </button>
        <button className="btn secondary small" onClick={restart}>
          ↺ Empezar de nuevo
        </button>
        <button className="btn secondary small" onClick={onBack}>
          Otra canción
        </button>
      </div>

      {done ? (
        <div className="mp-result g-center">
          <p className="g-win">🎉 ¡Lo lograste!</p>
          <p className="mp-stars" aria-label={`${stars} de 3 estrellas`}>
            {'⭐'.repeat(stars)}
            <span className="mp-stars-off">{'⭐'.repeat(3 - stars)}</span>
          </p>
          <p className="mp-winner">
            {hits} notas bien · {misses} {misses === 1 ? 'error' : 'errores'}
          </p>
          <p className="muted">{song.credit}</p>
          <div className="row start">
            <button className="btn big" onClick={restart}>
              Tocarla otra vez
            </button>
            <button className="btn secondary" onClick={onBack}>
              Otra canción
            </button>
          </div>
        </div>
      ) : (
        <div className="mp-strip" aria-label="Notas que siguen">
          {chips.map((m, i) => {
            const n = first + i
            const state = n < index ? 'past' : n === index ? 'now' : ''
            return (
              <span key={n} className={`mp-chip ${state}`}>
                {pitchName(pitchOfMidi(m))}
              </span>
            )
          })}
        </div>
      )}
      <div className="mp-progress" aria-hidden>
        <span style={{ width: `${(index / expected.length) * 100}%` }} />
      </div>

      <Keyboard
        size={size}
        inst={settings.inst}
        labels={help ? 'notes' : 'none'}
        target={help && !done && !demo ? expected[index] : undefined}
        lit={lit}
        flash={flash}
        onPlay={onPlay}
      />
      <p className="muted mp-hint">
        {demo
          ? 'Escucha y mira las teclas…'
          : 'Toca la tecla que sigue. Con el mouse o con el teclado de la computadora.'}
      </p>
    </>
  )
}
