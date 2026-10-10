import type { Art, Scene } from './scenes'

export function SceneArt({ scene }: { scene: Scene }): React.JSX.Element {
  return (
    <div className="rp-pic" style={{ background: scene.bg }} aria-hidden>
      {scene.items.map(([emoji, x, y, size], i) => (
        <span
          key={i}
          className="rp-emoji"
          style={{ left: `${x}%`, top: `${y}%`, fontSize: `${size}cqw` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  )
}

export function ArtPicture({ art }: { art: Art }): React.JSX.Element {
  return 'scene' in art ? (
    <SceneArt scene={art.scene} />
  ) : (
    <div className="rp-pic" style={{ backgroundImage: `url("${art.url}")` }} aria-hidden />
  )
}
