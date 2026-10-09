// Archivos que se leen como texto al compilar (por ejemplo la llave pública de las claves)
declare module '*?raw' {
  const content: string
  export default content
}
