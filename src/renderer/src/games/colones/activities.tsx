import { useState } from 'react'
import { shuffle } from '../../lib/games/shuffle'
import Choices from '../_manip/Choices'
import type { Ctx } from '../_manip/Runner'
import { oneOf, rand, takeUnique } from '../_manip/util'
import { MoneyBuilder, Piece, Pile } from './Money'
import { describe, minPieces, pieceSize, randomPile } from './moneyUtil'
import { BILLS, CHANGE_PAIRS, STORES, denomOf, levelOf, money, type StoreItem } from './data'

export function FormAmount({ ctx, level: id }: { ctx: Ctx; level: number }): React.JSX.Element {
  const level = levelOf(id)
  const [q] = useState(() => randomPile(level))
  return (
    <MoneyBuilder
      ctx={ctx}
      target={q.total}
      denoms={level.denoms}
      help={level.help}
      heading={
        <>
          <span className="cl-ask">Forma</span>
          <span className="cl-target">{money(q.total)}</span>
        </>
      }
    />
  )
}

export function CountMoney({ ctx, level: id }: { ctx: Ctx; level: number }): React.JSX.Element {
  const level = levelOf(id)
  const [q] = useState(() => {
    const { values, total } = randomPile(level)
    const steps = [10, 25, 50, 100, 500, 1000].filter((s) => s <= Math.max(total / 4, 10))
    const unit = values.reduce((a, b) => Math.min(a, b))
    const cands: number[] = []
    for (const s of [...steps, unit, unit * 2]) {
      cands.push(total + s, total - s)
    }
    cands.push(total + 100, total - 100, Math.round(total * 1.1), Math.round(total * 0.9))
    const wrong = takeUnique(
      cands.filter((c) => c > 0 && c !== total && c % 5 === 0),
      3,
      String
    )
    const options = [total, ...wrong].sort((a, b) => a - b)
    return { values, total, options }
  })
  return (
    <div className="cl-count">
      <p className="cl-ask center">¿Cuánto dinero hay?</p>
      <div className="cl-pilebox">
        <Pile values={q.values} height={q.values.length > 6 ? 250 : 210} />
      </div>
      <Choices
        ctx={ctx}
        answerId={String(q.total)}
        explain={`Hay ${money(q.total)}: ${describe(q.values)}`}
        choices={q.options.map((o) => ({
          id: String(o),
          label: money(o),
          content: <span className="cl-opt">{money(o)}</span>
        }))}
      />
    </div>
  )
}

interface Purchase {
  lines: { item: StoreItem; qty: number }[]
  total: number
  pay: number
  change: number
  shop: 'pulperia' | 'feria'
}

function makePurchase(shopPref: 'pulperia' | 'feria' | 'mix', many: boolean): Purchase {
  const shop = shopPref === 'mix' ? oneOf(['pulperia', 'feria'] as const) : shopPref
  const items = STORES[shop].items
  for (let i = 0; i < 200; i++) {
    const count = many ? rand(2, 3) : 1
    const picked = takeUnique(items, count, (x) => x.name)
    const lines = picked.map((item) => ({ item, qty: many ? rand(1, 3) : rand(1, 2) }))
    const total = lines.reduce((a, l) => a + l.item.price * l.qty, 0)
    if (total > 15000 || total < 300) continue
    const bigger = BILLS.filter((b) => b.value > total).map((b) => b.value)
    if (!bigger.length) continue
    const pay = bigger.length > 1 && rand(0, 2) === 0 ? bigger[1] : bigger[0]
    return { lines, total, pay, change: pay - total, shop }
  }
  const item = items[0]
  return {
    lines: [{ item, qty: 1 }],
    total: item.price,
    pay: 2000,
    change: 2000 - item.price,
    shop
  }
}

export function Shopping({
  ctx,
  shop,
  many
}: {
  ctx: Ctx
  shop: 'pulperia' | 'feria' | 'mix'
  many: boolean
}): React.JSX.Element {
  const [q] = useState(() => makePurchase(shop, many))
  const store = STORES[q.shop]
  const palette = [50, 100, 500, ...BILLS.map((b) => b.value).filter((v) => v < q.pay)]
  const s = pieceSize(denomOf(q.pay), 1.1)
  return (
    <MoneyBuilder
      ctx={ctx}
      target={q.change}
      denoms={palette}
      help={!many}
      okMessage={`Total ${money(q.total)}, vuelto ${money(q.change)}`}
      failMessage={`Total ${money(q.total)}; el vuelto es ${money(q.change)}: ${describe(minChange(q.change, palette))}`}
      heading={
        <div className="cl-shop">
          <div className="cl-lines">
            {q.lines.map((l) => (
              <div key={l.item.name} className="cl-line">
                <span className="cl-line-emoji" aria-hidden>
                  {l.item.emoji.repeat(Math.min(l.qty, 3))}
                </span>
                <span className="cl-line-name">
                  {l.item.name}
                  {l.qty > 1 ? ` × ${l.qty}` : ''} · <b>{money(l.item.price)}</b>
                  {l.qty > 1 ? ' c/u' : ''}
                </span>
              </div>
            ))}
          </div>
          <div className="cl-pay">
            <div className="cl-shop-title">
              {store.icon} {store.title}
            </div>
            Pagas con <Piece value={q.pay} width={s.w} /> <b>¿Cuánto es el vuelto?</b>
          </div>
        </div>
      }
    />
  )
}

const minChange = (n: number, palette: number[]): number[] => minPieces(n, palette) ?? []

interface ChangeQ {
  big: number
  small: number
  ratio: number
  mode: 'count' | 'build'
  options: number[]
  allowed: number[]
}

function makeChange(id: number): ChangeQ {
  const pool = CHANGE_PAIRS.filter((p) => (id === 1 ? p.big <= 100 : p.level <= id))
  const exact = pool.filter((x) => (id === 1 ? true : x.level === id))
  const p = oneOf(rand(0, 2) > 0 && exact.length ? exact : pool)
  const ratio = p.big / p.small
  const allowed = [10, 25, 50, 100, 500, 1000, 2000, 5000, 10000].filter(
    (d) => d < p.big && p.big % d === 0 && p.big / d <= 12
  )
  const build = allowed.length > 0 && ratio <= 12 && rand(0, 1) === 0
  const wrong = takeUnique(
    [
      ratio * 2,
      Math.max(1, Math.round(ratio / 2)),
      ratio + 1,
      ratio - 1,
      ratio + 5,
      ratio * 10,
      ratio + 2,
      ratio - 2
    ].filter((x) => x > 0 && x !== ratio),
    3,
    String
  )
  const options = [ratio, ...wrong].sort((a, b) => a - b)
  return { big: p.big, small: p.small, ratio, mode: build ? 'build' : 'count', options, allowed }
}

export function Exchange({ ctx, level }: { ctx: Ctx; level: number }): React.JSX.Element {
  const [q] = useState(() => makeChange(level))
  const big = denomOf(q.big)
  const small = denomOf(q.small)
  const sb = pieceSize(big, 1.3)
  const ss = pieceSize(small, 1.2)
  const noun = (v: number, n: number): string =>
    denomOf(v).kind === 'bill' ? (n === 1 ? 'billete' : 'billetes') : n === 1 ? 'moneda' : 'monedas'
  if (q.mode === 'build')
    return (
      <MoneyBuilder
        ctx={ctx}
        target={q.big}
        denoms={q.allowed}
        help
        heading={
          <div className="cl-swap">
            <span className="cl-ask">Cambia</span>
            <Piece value={q.big} width={sb.w} />
            <span className="cl-ask">por monedas o billetes más chicos</span>
          </div>
        }
      />
    )
  return (
    <div className="cl-count">
      <p className="cl-ask center">
        ¿Cuántos {noun(q.small, 2)} de {money(q.small)} caben en{' '}
        {big.kind === 'bill' ? 'un billete' : 'una moneda'} de {money(q.big)}?
      </p>
      <div className="cl-equation" aria-hidden>
        <Piece value={q.big} width={sb.w} />
        <span className="cl-eq">=</span>
        <span className="cl-qmark">?</span>
        <span className="cl-eq">×</span>
        <Piece value={q.small} width={ss.w} />
      </div>
      <Choices
        ctx={ctx}
        answerId={String(q.ratio)}
        explain={`${q.ratio} ${noun(q.small, q.ratio)} de ${money(q.small)}: ${q.ratio} × ${q.small} = ${q.big}`}
        praise={`${q.ratio} × ${money(q.small)} = ${money(q.big)}`}
        choices={shuffle(q.options).map((o) => ({
          id: String(o),
          label: String(o),
          content: <span className="cl-opt">{o}</span>
        }))}
      />
    </div>
  )
}
