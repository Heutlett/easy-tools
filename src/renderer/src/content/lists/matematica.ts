/** Matemática: vocabulario para ahorcado y palabras desordenadas. */
import { defineWordLists } from '../define'

export default defineWordLists('matematica', [
  {
    title: 'Figuras geométricas',
    grades: [1, 2, 3],
    topic: 'Figuras y cuerpos geométricos',
    words: [
      ['círculo', 'Figura redonda, sin lados ni esquinas'],
      ['cuadrado', 'Cuatro lados iguales y cuatro ángulos rectos'],
      ['triángulo', 'Figura de tres lados'],
      ['rectángulo', 'Cuatro lados: dos largos y dos cortos'],
      ['rombo', 'Cuatro lados iguales, parece un cuadrado «inclinado»'],
      ['pentágono', 'Polígono de cinco lados'],
      ['hexágono', 'Polígono de seis lados'],
      ['octágono', 'Polígono de ocho lados; así es la señal de ALTO'],
      ['trapecio', 'Cuadrilátero con un solo par de lados paralelos'],
      ['óvalo', 'Figura redonda alargada, como un huevo'],
      ['polígono', 'Figura plana cerrada formada por lados rectos'],
      ['lado', 'Cada línea que forma el borde de una figura'],
      ['vértice', 'Punto donde se unen dos lados'],
      ['figura', 'Dibujo con forma, como el círculo o el cuadrado']
    ]
  },
  {
    title: 'Cuerpos geométricos',
    grades: [1, 2, 3, 4],
    topic: 'Figuras y cuerpos geométricos',
    words: [
      ['esfera', 'Tiene la forma de una pelota'],
      ['cubo', 'Tiene la forma de un dado'],
      ['cono', 'Tiene la forma de un helado de barquillo'],
      ['cilindro', 'Tiene la forma de una lata de atún'],
      ['pirámide', 'Tiene base y caras triangulares que se juntan en punta'],
      ['prisma', 'Cuerpo con dos bases iguales y caras laterales rectangulares'],
      ['cara', 'Cada superficie plana de un cuerpo geométrico'],
      ['arista', 'Línea donde se unen dos caras'],
      ['vértice', 'Punto donde se unen varias aristas'],
      ['base', 'Cara sobre la que se apoya un cuerpo'],
      ['altura', 'Distancia entre la base y la parte más alta']
    ]
  },
  {
    title: 'Números en letras',
    grades: [1, 2, 3],
    topic: 'Números naturales',
    words: [
      ['diez', '10'],
      ['quince', '15'],
      ['veinte', '20'],
      ['treinta', '30'],
      ['cuarenta', '40'],
      ['cincuenta', '50'],
      ['sesenta', '60'],
      ['setenta', '70'],
      ['ochenta', '80'],
      ['noventa', '90'],
      ['cien', '100'],
      ['doscientos', '200'],
      ['quinientos', '500'],
      ['setecientos', '700'],
      ['novecientos', '900'],
      ['mil', '1000'],
      ['dieciséis', '16'],
      ['veinticinco', '25']
    ]
  },
  {
    title: 'Términos de las operaciones',
    grades: [2, 3, 4],
    topic: 'Operaciones con naturales',
    words: [
      ['suma', 'Operación para juntar cantidades'],
      ['resta', 'Operación para quitar una cantidad a otra'],
      ['multiplicación', 'Operación que repite una suma de números iguales'],
      ['división', 'Operación que reparte en partes iguales'],
      ['sumando', 'Cada número que se suma'],
      ['total', 'Resultado de una suma'],
      ['diferencia', 'Resultado de una resta'],
      ['factor', 'Cada número que se multiplica'],
      ['producto', 'Resultado de una multiplicación'],
      ['dividendo', 'Número que se divide'],
      ['divisor', 'Número entre el que se divide'],
      ['cociente', 'Resultado de una división'],
      ['residuo', 'Lo que sobra al dividir'],
      ['doble', 'Dos veces una cantidad'],
      ['mitad', 'Una de dos partes iguales']
    ]
  },
  {
    title: 'Unidades de medida',
    grades: [2, 3, 4],
    topic: 'Medidas',
    words: [
      ['metro', 'Unidad básica de longitud'],
      ['centímetro', 'Centésima parte de un metro'],
      ['milímetro', 'Milésima parte de un metro'],
      ['kilómetro', 'Mil metros'],
      ['gramo', 'Unidad pequeña de masa'],
      ['kilogramo', 'Mil gramos'],
      ['litro', 'Unidad de capacidad'],
      ['mililitro', 'Milésima parte de un litro'],
      ['segundo', 'Sesenta de ellos forman un minuto'],
      ['minuto', 'Sesenta de ellos forman una hora'],
      ['hora', 'Veinticuatro de ellas forman un día'],
      ['semana', 'Siete días'],
      ['colón', 'Moneda de Costa Rica'],
      ['grado', 'Unidad para medir ángulos y temperatura'],
      ['balanza', 'Instrumento para medir el peso'],
      ['regla', 'Instrumento para medir la longitud']
    ]
  },
  {
    title: 'Dinero y compras',
    grades: [1, 2, 3, 4],
    topic: 'Dinero',
    words: [
      ['colón', 'Moneda de Costa Rica'],
      ['moneda', 'Dinero de metal'],
      ['billete', 'Dinero de papel o polímero'],
      ['vuelto', 'Dinero que devuelven si se paga de más'],
      ['precio', 'Lo que cuesta algo'],
      ['ahorro', 'Dinero que se guarda para después'],
      ['descuento', 'Rebaja en el precio'],
      ['pulpería', 'Tienda pequeña del barrio'],
      ['feria', 'Mercado donde se venden frutas y verduras'],
      ['cajero', 'Persona que cobra en la caja'],
      ['factura', 'Papel que comprueba una compra'],
      ['presupuesto', 'Plan de cuánto dinero gastar']
    ]
  },
  {
    title: 'Fracciones y decimales',
    grades: [4, 5, 6],
    topic: 'Fracciones',
    words: [
      ['fracción', 'Número que expresa partes de un todo'],
      ['numerador', 'Número de arriba en una fracción'],
      ['denominador', 'Número de abajo en una fracción'],
      ['equivalente', 'Fracciones que valen lo mismo'],
      ['simplificar', 'Hacer una fracción con números menores sin cambiar su valor'],
      ['impropia', 'Fracción con numerador mayor que el denominador'],
      ['mixto', 'Número formado por un entero y una fracción'],
      ['homogéneas', 'Fracciones con el mismo denominador'],
      ['decimal', 'Número con coma, como 3,5'],
      ['décima', 'Una de diez partes iguales'],
      ['centésima', 'Una de cien partes iguales'],
      ['milésima', 'Una de mil partes iguales'],
      ['porcentaje', 'Cantidad por cada cien'],
      ['inverso', 'Fracción que se obtiene al invertir numerador y denominador']
    ]
  },
  {
    title: 'Geometría y medidas de figuras',
    grades: [3, 4, 5, 6],
    topic: 'Geometría',
    words: [
      ['ángulo', 'Abertura entre dos líneas que se unen'],
      ['recto', 'Ángulo de 90°'],
      ['agudo', 'Ángulo menor que 90°'],
      ['obtuso', 'Ángulo mayor que 90° y menor que 180°'],
      ['paralelas', 'Rectas que siempre están a la misma distancia y nunca se cruzan'],
      ['perpendiculares', 'Rectas que se cruzan formando un ángulo recto'],
      ['diagonal', 'Segmento que une dos vértices que no son vecinos'],
      ['perímetro', 'Suma de los lados de una figura'],
      ['área', 'Espacio que ocupa una superficie'],
      ['volumen', 'Espacio que ocupa un cuerpo'],
      ['radio', 'Distancia del centro a la circunferencia'],
      ['diámetro', 'Cuerda que pasa por el centro'],
      ['circunferencia', 'Línea curva cuyos puntos están a igual distancia del centro'],
      ['simetría', 'Una mitad es reflejo de la otra'],
      ['transportador', 'Instrumento para medir ángulos'],
      ['isósceles', 'Triángulo con dos lados iguales'],
      ['equilátero', 'Triángulo con tres lados iguales'],
      ['escaleno', 'Triángulo con tres lados distintos']
    ]
  },
  {
    title: 'Estadística y probabilidad',
    grades: [3, 4, 5, 6],
    topic: 'Datos y gráficos',
    words: [
      ['moda', 'Dato que más se repite'],
      ['media', 'Resultado de sumar los datos y dividir entre su cantidad'],
      ['mediana', 'Dato que queda en el centro al ordenar'],
      ['recorrido', 'Diferencia entre el dato mayor y el menor'],
      ['frecuencia', 'Cuántas veces se repite un dato'],
      ['encuesta', 'Preguntas para recoger datos'],
      ['tabla', 'Organiza los datos en filas y columnas'],
      ['gráfico', 'Dibujo que muestra datos'],
      ['pictograma', 'Gráfico con dibujos'],
      ['muestra', 'Parte de un grupo que se estudia'],
      ['población', 'Todo el grupo que se quiere estudiar'],
      ['probabilidad', 'Qué tan posible es que algo ocurra'],
      ['azar', 'Cuando no se sabe qué resultado saldrá'],
      ['imposible', 'Evento que nunca ocurre'],
      ['seguro', 'Evento que siempre ocurre']
    ]
  },
  {
    title: 'Teoría de números y álgebra',
    grades: [5, 6],
    topic: 'Múltiplos y divisores',
    words: [
      ['múltiplo', 'Resultado de multiplicar un número por otro natural'],
      ['divisor', 'Número que divide a otro sin dejar residuo'],
      ['primo', 'Número con solo dos divisores: 1 y él mismo'],
      ['compuesto', 'Número con más de dos divisores'],
      ['potencia', 'Producto de factores iguales'],
      ['exponente', 'Número pequeño que indica cuántas veces se multiplica la base'],
      ['base', 'Número que se multiplica por sí mismo en una potencia'],
      ['razón', 'Comparación de dos cantidades mediante una división'],
      ['proporción', 'Igualdad entre dos razones'],
      ['ecuación', 'Igualdad con un valor desconocido'],
      ['incógnita', 'Valor que se desea encontrar'],
      ['divisibilidad', 'Cuando un número se puede dividir exacto entre otro'],
      ['cuadrado', 'Resultado de multiplicar un número por sí mismo'],
      ['cubo', 'Resultado de multiplicar un número tres veces por sí mismo'],
      ['factorización', 'Escribir un número como producto de primos']
    ]
  }
])
