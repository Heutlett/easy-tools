import { useRef, useState } from 'react'
import { mod } from '../_manip/util'
import { sfx } from '../../lib/games/sfx'
import { digital, hm, words } from './time'

interface Props {
  /** Minutos desde la medianoche (0 a 1439) */
  t: number
  onChange?: (t: number) => void
  /** Cada cuántos minutos salta la manecilla grande al arrastrarla */
  snap?: number
  /** Números de 5 en 5 minutos alrededor del reloj */
  showMinutes?: boolean
  /** Una hora de referencia que se dibuja con manecillas verdes de contorno (la respuesta) */
  ghost?: number
  tone?: 'normal' | 'ok' | 'bad'
}

const C = 200
const rad = (deg: number): number => (deg * Math.PI) / 180
const at = (r: number, deg: number): [number, number] => [
  C + r * Math.sin(rad(deg)),
  C - r * Math.cos(rad(deg))
]

/** Reloj analógico en SVG; si tiene `onChange`, las manecillas se arrastran con el mouse o el dedo y se mueven con las flechas. */
export default function Clock({
  t,
  onChange,
  snap = 5,
  showMinutes = false,
  ghost,
  tone = 'normal'
}: Props): React.JSX.Element {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<{ hand: 'h' | 'm'; accum: number; last: number } | null>(null)
  const [dragging, setDragging] = useState<'h' | 'm' | null>(null)
  const interactive = !!onChange
  const { h, m } = hm(t)
  const minuteAngle = m * 6
  const hourAngle = (mod(t, 720) / 720) * 360

  const emit = (next: number): void => {
    const v = mod(Math.round(next), 1440)
    if (v === t || !onChange) return
    if (Math.floor(v / 60) !== h) sfx.pop()
    else sfx.tick()
    onChange(v)
  }

  const pointAngle = (e: React.PointerEvent): { deg: number; r: number } => {
    const rect = svg.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 400 - C
    const y = ((e.clientY - rect.top) / rect.height) * 400 - C
    return { deg: (Math.atan2(x, -y) * 180) / Math.PI + (x < 0 ? 360 : 0), r: Math.hypot(x, y) }
  }

  const down = (e: React.PointerEvent): void => {
    if (!interactive) return
    const { deg } = pointAngle(e)
    const rect = svg.current!.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * 400
    const py = ((e.clientY - rect.top) / rect.height) * 400
    const [hx, hy] = at(80, hourAngle)
    const [mx, my] = at(150, minuteAngle)
    const dh = Math.hypot(px - hx, py - hy)
    const dm = Math.hypot(px - mx, py - my)
    const hand: 'h' | 'm' = dh < dm * 0.8 ? 'h' : 'm'
    e.preventDefault()
    svg.current!.setPointerCapture(e.pointerId)
    svg.current!.focus()
    setDragging(hand)
    if (hand === 'm') {
      const raw = deg / 6
      let accum = t - m + raw
      if (raw - m > 30) accum -= 60
      else if (raw - m < -30) accum += 60
      drag.current = { hand, accum, last: raw }
      emit(Math.round(accum / snap) * snap)
    } else {
      drag.current = { hand, accum: 0, last: deg }
      moveHour(deg)
    }
  }

  const moveHour = (deg: number): void => {
    const hour = mod(Math.round(deg / 30 - m / 60), 12)
    emit(Math.floor(t / 720) * 720 + hour * 60 + m)
  }

  const move = (e: React.PointerEvent): void => {
    const d = drag.current
    if (!d) return
    const { deg } = pointAngle(e)
    if (d.hand === 'h') return moveHour(deg)
    const raw = deg / 6
    let delta = raw - d.last
    if (delta > 30) delta -= 60
    else if (delta < -30) delta += 60
    d.accum += delta
    d.last = raw
    emit(Math.round(d.accum / snap) * snap)
  }

  const up = (): void => {
    drag.current = null
    setDragging(null)
  }

  const key = (e: React.KeyboardEvent): void => {
    if (!interactive) return
    const step: Record<string, number> = {
      ArrowRight: snap,
      ArrowLeft: -snap,
      ArrowUp: 60,
      ArrowDown: -60
    }
    if (e.key in step) {
      e.preventDefault()
      emit(t + step[e.key])
    }
  }

  const ghostT = ghost !== undefined ? hm(ghost) : null
  const hand = (
    angle: number,
    len: number,
    back: number,
    width: number,
    cls: string
  ): React.JSX.Element => (
    <g
      style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${C}px ${C}px` }}
      className={cls}
    >
      <line x1={C} y1={C + back} x2={C} y2={C - len} strokeWidth={width} strokeLinecap="round" />
      <polygon
        points={`${C - width * 1.1},${C - len + width} ${C},${C - len - width * 1.4} ${C + width * 1.1},${C - len + width}`}
      />
    </g>
  )

  return (
    <svg
      ref={svg}
      className={`rl-clock ${interactive ? 'interactive' : ''} ${tone} ${dragging ? 'dragging' : ''}`}
      viewBox="0 0 400 400"
      role="img"
      tabIndex={interactive ? 0 : -1}
      aria-label={`Reloj: ${words(t)}. ${digital(t, '12')}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
    >
      <circle cx={C} cy={C} r={192} className="rl-face" />
      {Array.from({ length: 60 }, (_, i) => {
        const [x1, y1] = at(i % 5 ? 174 : 168, i * 6)
        const [x2, y2] = at(182, i * 6)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={i % 5 ? 'rl-tick' : 'rl-tick big'}
          />
        )
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const [x, y] = at(showMinutes ? 112 : 130, n * 30)
        return (
          <text key={n} x={x} y={y} className="rl-num">
            {n}
          </text>
        )
      })}
      {showMinutes &&
        Array.from({ length: 12 }, (_, i) => {
          const n = (i + 1) * 5
          const [x, y] = at(146, (i + 1) * 30)
          return (
            <text key={n} x={x} y={y} className="rl-min">
              {n === 60 ? '0' : n}
            </text>
          )
        })}
      {ghostT && (
        <g className="rl-ghost">
          {hand(((ghostT.h % 12) * 60 + ghostT.m) / 2, 80, 14, 7, 'rl-ghost-hand')}
          {hand(ghostT.m * 6, 150, 18, 5, 'rl-ghost-hand')}
        </g>
      )}
      {hand(hourAngle, 80, 14, 8, `rl-hand hour ${dragging === 'h' ? 'active' : ''}`)}
      {hand(minuteAngle, 150, 18, 5, `rl-hand minute ${dragging === 'm' ? 'active' : ''}`)}
      <circle cx={C} cy={C} r={11} className="rl-cap" />
      {interactive && (
        <>
          <circle {...pos(at(80, hourAngle))} r={22} className="rl-grip" />
          <circle {...pos(at(150, minuteAngle))} r={22} className="rl-grip" />
        </>
      )}
    </svg>
  )
}

const pos = ([cx, cy]: [number, number]): { cx: number; cy: number } => ({ cx, cy })
