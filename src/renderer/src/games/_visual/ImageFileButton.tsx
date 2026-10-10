import { useRef } from 'react'

interface Props {
  label: string
  multiple?: boolean
  className?: string
  onFiles: (files: File[]) => void
}

/** Botón para elegir archivos de imagen del computador (se cargan en memoria, no se guardan). */
export default function ImageFileButton({
  label,
  multiple,
  className = 'btn secondary',
  onFiles
}: Props): React.JSX.Element {
  const input = useRef<HTMLInputElement>(null)
  return (
    <>
      <button type="button" className={className} onClick={() => input.current?.click()}>
        {label}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        aria-label={label}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length) onFiles(files)
        }}
      />
    </>
  )
}
