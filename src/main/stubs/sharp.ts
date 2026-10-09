// sharp falla dentro de Electron. @imgly/background-removal-node lo importa y crea una instancia
// aunque no la use, pero nosotros siempre le pasamos y le pedimos imágenes RGBA crudas.
// Si algún día se intentara usar de verdad, falla con un mensaje claro.
export default function sharp(): never {
  return new Proxy(
    {},
    {
      get() {
        throw new Error('sharp no está disponible en esta aplicación')
      }
    }
  ) as never
}
