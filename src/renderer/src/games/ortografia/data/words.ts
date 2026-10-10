import type { Grade } from '../../../content/types'
import type { RuleId } from '../rules'

/*
 * Palabras para completar y para elegir «la que está bien escrita».
 * En cada palabra, {…} marca la letra o las letras que hay que elegir (por ejemplo, ca{b}allo);
 * {} sin nada marca «sin h». Una palabra sin llaves solo sirve para «¿Cuál está bien escrita?».
 * Cada grupo trae la regla (o el recordatorio) que se muestra después de responder.
 */
export interface WordGroup {
  grade: Grade
  rule: RuleId
  why: string
  words: string[]
}

const g = (grade: Grade, rule: RuleId, why: string, list: string): WordGroup => ({
  grade,
  rule,
  why,
  words: list.split(/\s+/).filter(Boolean)
})

export const wordGroups: WordGroup[] = [
  // ───────────────────────── 2.º ─────────────────────────
  g(
    2,
    'rrr',
    'Entre vocales, el sonido fuerte de la r se escribe rr: perro, carro.',
    'pe{rr}o ca{rr}o to{rr}e ja{rr}a ba{rr}o ce{rr}o zo{rr}o bu{rr}o a{rr}oz guita{rr}a tie{rr}a ca{rr}era'
  ),
  g(
    2,
    'rrr',
    'Al principio de la palabra, el sonido fuerte se escribe con una sola r: rana, ratón.',
    '{r}ana {r}atón {r}osa {r}ojo {r}ío {r}ueda {r}egalo {r}isa {r}emo {r}ico {r}opa {r}amo'
  ),
  g(
    2,
    'rrr',
    'Entre vocales, el sonido suave se escribe con una sola r: cara, toro.',
    'ca{r}a to{r}o pa{r}ed si{r}ena ma{r}iposa colo{r}ado pa{r}aguas a{r}oma lo{r}o mi{r}ar'
  ),
  g(
    2,
    'mp',
    'Antes de p y de b se escribe m: campo, hombre.',
    'ca{m}po ca{m}pana ca{m}bio lá{m}para ta{m}bor ho{m}bre sie{m}pre tie{m}po so{m}bra so{m}brero bo{m}bero no{m}bre cu{m}pleaños eje{m}plo li{m}pio tro{m}peta'
  ),
  g(
    2,
    'mp',
    'Antes de las demás letras se escribe n: canto, mundo.',
    'ca{n}to mu{n}do pla{n}ta ve{n}tana ma{n}zana gra{n}de te{n}go pe{n}sar co{n}tar ba{n}co fa{n}tasma elefa{n}te'
  ),
  g(
    2,
    'gu',
    'Con gue y gui la u no se pronuncia: guitarra, guerra, guiso.',
    'guitarra guerra guiso juguete manguera guiño seguir hormiguero'
  ),
  g(
    2,
    'gu',
    'Con que y qui la u no se pronuncia y se escribe qu, nunca k: queso, quince.',
    'queso quince parque quiero mantequilla esqueleto quesadilla quetzal quemar queja quitar pequeño chiquito esquina quinto tranquilo'
  ),
  g(
    2,
    'csz',
    'Ce y ci se escriben con c: cena, cielo, cinco.',
    '{c}ielo {c}ebolla {c}ereza {c}ine {c}iudad {c}entro {c}elular {c}erdo {c}epillo {c}ierto {c}emento {c}ena {c}inco'
  ),
  g(
    2,
    'csz',
    'Con za, zo y zu se escribe z: zapato, zorro, zurdo.',
    '{z}apato {z}orro {z}anahoria {z}apatilla {z}urdo {z}ancos {z}ona {z}arpa'
  ),
  g(
    2,
    'csz',
    'Con sa, se, si, so y su se escribe s: semana, silla, siete.',
    '{s}emana {s}illa {s}ábado {s}andía {s}erpiente {s}uave {s}ombrero {s}ueño {s}ilencio {s}iete {s}eis {s}ábana'
  ),
  g(2, 'bv', 'Después de m se escribe b: tambor, ambos.', 'tam{b}or am{b}os tim{b}re cam{b}io'),
  g(
    2,
    'bv',
    'Con bl y br se escribe b: blusa, brazo.',
    '{b}lusa {b}lanco {b}razo {b}risa a{b}rigo {b}ruja li{b}ro ca{b}ra pala{b}ra'
  ),
  g(
    2,
    'bv',
    'Hay que aprenderla con v: ventana, verde, vaso.',
    '{v}entana {v}erde {v}aso {v}estido {v}iento {v}olcán {v}ida {v}ecino {v}elero {v}erano {v}iaje'
  ),
  g(
    2,
    'bv',
    'Hay que aprenderla con b: caballo, abuela, abeja.',
    'ca{b}allo a{b}uela a{b}eja ca{b}eza tra{b}ajo {b}oca {b}icicleta {b}ueno a{b}rir'
  ),
  g(
    2,
    'h',
    'Las palabras que empiezan con hue- y hie- llevan h: huevo, hielo.',
    '{h}uevo {h}ueso {h}ielo {h}ierba {h}uerto {h}ierro'
  ),
  g(
    2,
    'h',
    'Hay palabras que empiezan con h aunque no se oiga: hormiga, hermano, hoja.',
    '{h}ormiga {h}ermano {h}oja {h}umo {h}istoria {h}elado {h}ijo {h}acer {h}ablar {h}ambre {h}otel {h}ospital'
  ),
  g(
    2,
    'h',
    'No lleva h: oso, uva, isla.',
    '{}oso {}uva {}aire {}abuelo {}isla {}ojo {}ocho {}arena'
  ),
  g(
    2,
    'lly',
    'Se escribe ll: calle, llave, lluvia, pollo.',
    'ca{ll}e {ll}ave {ll}uvia po{ll}o si{ll}a ga{ll}ina {ll}amar {ll}egar amari{ll}o'
  ),
  g(
    2,
    'lly',
    'Se escribe y: playa, mayo, ayer, payaso.',
    'pla{y}a ma{y}o {y}ema a{y}er pa{y}aso {y}ate {y}ogur ra{y}o'
  ),

  // ───────────────────────── 3.º ─────────────────────────
  g(
    3,
    'gu',
    'Se escribe güe o güi cuando la u se pronuncia: pingüino, cigüeña.',
    'pin{gü}ino ci{gü}eña ver{gü}enza'
  ),
  g(
    3,
    'csz',
    'Las palabras terminadas en -ción llevan c: canción, estación.',
    'can{c}ión esta{c}ión habita{c}ión invita{c}ión educa{c}ión celebra{c}ión aten{c}ión pobla{c}ión conversa{c}ión'
  ),
  g(
    3,
    'csz',
    'Con ce y ci se escribe c: cereal, circuito, celda.',
    '{c}ereal {c}ircuito {c}ierre {c}ebada {c}icatriz {c}ítrico {c}elebrar {c}elda {c}erca'
  ),
  g(
    3,
    'csz',
    'Con za, zo, zu se escribe z: zumbido, zanja, zorrillo.',
    '{z}umbido {z}anja {z}orrillo {z}ancudo {z}acate {z}ambullirse'
  ),
  g(
    3,
    'bv',
    'Los verbos terminados en -aba llevan b: cantaba, jugaba, saltaba.',
    'canta{b}a juga{b}a salta{b}a baila{b}a nada{b}a mira{b}a pinta{b}a estudia{b}a'
  ),
  g(
    3,
    'bv',
    'Después de n se escribe v: invierno, envase.',
    'in{v}ierno en{v}ase en{v}iar con{v}ersar in{v}itar in{v}ento en{v}olver en{v}idia con{v}ivir'
  ),
  g(
    3,
    'bv',
    'Las palabras que empiezan con bu-, bur- y bus- llevan b: burro, buscar.',
    '{b}uscar {b}urro {b}urbuja {b}ufanda {b}uzón {b}urla'
  ),
  g(
    3,
    'bv',
    'Los verbos terminados en -bir llevan b: escribir, recibir, subir (menos hervir, servir y vivir).',
    'escri{b}ir reci{b}ir su{b}ir prohi{b}ir conce{b}ir perci{b}ir'
  ),
  g(
    3,
    'gj',
    'Con ga, go, gu y con gl, gr se escribe g: gato, lago, tigre.',
    '{g}ato {g}usano {g}alleta {g}allina la{g}o ami{g}o fue{g}o ti{g}re {g}lobo'
  ),
  g(
    3,
    'gj',
    'Con ja, jo y ju se escribe j: jabón, ojo, juego.',
    '{j}abón {j}uego {j}ugo o{j}o ro{j}o ca{j}a ho{j}a abe{j}a ove{j}a naran{j}a {j}uguete'
  ),
  g(
    3,
    'gj',
    'Muchas palabras con ge y gi llevan g: gente, girasol, gigante.',
    '{g}ente {g}irasol {g}igante {g}elatina {g}emelo {g}imnasia {g}eneral cole{g}io'
  ),
  g(
    3,
    'gj',
    'Otras palabras con je y ji llevan j: jefe, jirafa, jinete.',
    '{j}efe {j}irafa {j}inete {j}ilguero {j}eringa mu{j}er vie{j}o cone{j}o espe{j}o te{j}er'
  ),
  g(
    3,
    'h',
    'Las palabras que empiezan con hum-, horm- y herm- llevan h: humo, hormiga, hermano.',
    '{h}umo {h}umano {h}ormiga {h}ermano {h}ermoso {h}umedad'
  ),
  g(
    3,
    'h',
    'Las palabras que empiezan con hui- y hue- llevan h: huir, huella, huérfano.',
    '{h}uir {h}uella {h}uérfano {h}uésped'
  ),
  g(
    3,
    'h',
    'La h puede ir en medio de la palabra: ahora, cohete, zanahoria.',
    'a{h}ora co{h}ete zana{h}oria almo{h}ada a{h}ogar ve{h}ículo pro{h}ibir ba{h}ía'
  ),
  g(
    3,
    'lly',
    'Las terminaciones -illo e -illa llevan ll: castillo, cuchillo, silla.',
    'casti{ll}o cuchi{ll}o ani{ll}o ladri{ll}o bolsi{ll}o meji{ll}a rodi{ll}a ardi{ll}a semi{ll}a torti{ll}a'
  ),
  g(
    3,
    'lly',
    'Al final de palabra, el sonido i se escribe y: hoy, muy, rey, ley.',
    'ho{y} mu{y} re{y} le{y} esto{y} so{y} vo{y} do{y}'
  ),
  g(
    3,
    'lly',
    'Se escribe y: leyenda, ayuda, mayo, joya.',
    'le{y}enda a{y}uda jo{y}a a{y}er ho{y}o'
  ),

  // ───────────────────────── 4.º ─────────────────────────
  g(
    4,
    'gu',
    'Se escribe güe o güi cuando la u se pronuncia: bilingüe, desagüe.',
    'bilin{gü}e desa{gü}e len{gü}eta a{gü}ero anti{gü}edad para{gü}ero'
  ),
  g(
    4,
    'bv',
    'Las palabras que empiezan por bi-, bis- y biblio- llevan b: bicicleta, bisabuelo, biblioteca.',
    '{b}icicleta {b}isabuelo {b}iblioteca {b}izcocho {b}iberón {b}iología'
  ),
  g(
    4,
    'bv',
    'Después de d se escribe v: advertir, adverbio, adversario.',
    'ad{v}ertir ad{v}erbio ad{v}ersidad ad{v}ersario'
  ),
  g(
    4,
    'bv',
    'Las palabras que empiezan por eva-, eve-, evi- y evo- llevan v: evitar, evento, evolución.',
    'e{v}itar e{v}ento e{v}olución e{v}aporar e{v}idente e{v}acuar'
  ),
  g(
    4,
    'bv',
    'Las palabras terminadas en -avo, -ave, -eve, -evo, -ivo llevan v: octavo, suave, breve, nuevo, activo (menos árabe y sílaba).',
    'octa{v}o sua{v}e nue{v}o acti{v}o bra{v}o gra{v}e bre{v}e le{v}e positi{v}o esclavo cla{v}e atracti{v}o'
  ),
  g(
    4,
    'bv',
    'El pretérito de andar, estar y tener lleva v: anduvo, estuvo, tuvo.',
    'andu{v}o estu{v}o tu{v}o estu{v}iste tu{v}imos andu{v}imos estu{v}ieron'
  ),
  g(
    4,
    'bv',
    'Los verbos terminados en -ver llevan v: volver, mover, llover.',
    'vol{v}er mo{v}er llo{v}er envol{v}er devol{v}er resol{v}er'
  ),
  g(
    4,
    'bv',
    'Las palabras terminadas en -ívoro llevan v: carnívoro, herbívoro.',
    'carní{v}oro herbí{v}oro omní{v}oro'
  ),
  g(
    4,
    'gj',
    'Las palabras terminadas en -aje llevan j: viaje, mensaje, garaje.',
    'via{j}e mensa{j}e gara{j}e pasa{j}e equipa{j}e lengua{j}e masa{j}e paisa{j}e cora{j}e homena{j}e aterriza{j}e'
  ),
  g(
    4,
    'gj',
    'Los verbos terminados en -ger y -gir llevan g: coger, proteger, dirigir, elegir.',
    'co{g}er prote{g}er esco{g}er reco{g}er diri{g}ir ele{g}ir exi{g}ir corre{g}ir sur{g}ir'
  ),
  g(
    4,
    'gj',
    'Las palabras terminadas en -gente y -gencia llevan g: agente, urgente, inteligente.',
    'a{g}ente ur{g}ente inteli{g}ente emer{g}encia ur{g}encia dili{g}ente'
  ),
  g(
    4,
    'gj',
    'Las palabras que empiezan por geo- llevan g: geografía, geometría.',
    '{g}eografía {g}eometría {g}eología {g}eólogo'
  ),
  g(
    4,
    'gj',
    'Las palabras terminadas en -gía, -gia y -logía llevan g: energía, biología, magia.',
    'ener{g}ía biolo{g}ía ecolo{g}ía tecnolo{g}ía ma{g}ia aler{g}ia zoolo{g}ía'
  ),
  g(
    4,
    'gj',
    'Las palabras terminadas en -jero y -jera llevan j: extranjero, mensajero, viajero.',
    'extran{j}ero mensa{j}ero via{j}ero ca{j}ero pasa{j}ero cerra{j}ero'
  ),
  g(4, 'gj', 'Tejer y crujir se escriben con j.', 'te{j}er cru{j}ir'),
  g(
    4,
    'csz',
    'Algunas palabras terminan en -sión con s: televisión, pasión, visión, decisión.',
    'televi{s}ión pa{s}ión vi{s}ión deci{s}ión explo{s}ión compren{s}ión inva{s}ión diver{s}ión'
  ),
  g(
    4,
    'csz',
    'Las palabras terminadas en -ancia y -encia llevan c: distancia, paciencia, ciencia.',
    'distan{c}ia pa{c}iencia {c}iencia audien{c}ia experien{c}ia importan{c}ia ausen{c}ia'
  ),
  g(
    4,
    'csz',
    'Las palabras terminadas en -anza llevan z: esperanza, enseñanza, confianza.',
    'esperan{z}a enseñan{z}a confian{z}a dan{z}a balan{z}a alaban{z}a'
  ),
  g(
    4,
    'csz',
    'Los sustantivos que nombran cualidades llevan z: niñez, pobreza, belleza, tristeza.',
    'niñe{z} pobre{z}a belle{z}a triste{z}a veje{z} sencille{z} limpie{z}a noble{z}a'
  ),
  g(
    4,
    'csz',
    'Cuando una palabra termina en z, el plural lleva c: lápiz → lápices.',
    'lápi{c}es pe{c}es lu{c}es vo{c}es cru{c}es feli{c}es nari{c}es ve{c}es nue{c}es'
  ),
  g(
    4,
    'lly',
    'Algunos verbos llevan y en la forma de él o ella: leer → leyó, caer → cayó.',
    'le{y}ó ca{y}ó o{y}ó constru{y}ó hu{y}ó destru{y}ó contribu{y}ó'
  ),
  g(
    4,
    'lly',
    'Se escribe ll: ballena, collar, cuello, estrella, botella.',
    'ba{ll}ena co{ll}ar cue{ll}o estre{ll}a bote{ll}a o{ll}a be{ll}o ga{ll}o'
  ),
  g(
    4,
    'lly',
    'Se escribe y: arroyo, apoyo, tuyo, yeso, yogur.',
    'arro{y}o apo{y}o tu{y}o {y}eso {y}ogur {y}ate a{y}uno'
  ),
  g(
    4,
    'h',
    'La h se escribe en medio de algunas palabras: prohibir, exhibir, alcohol, ahorrar.',
    'pro{h}ibir ex{h}ibir alco{h}ol a{h}orrar in{h}alar an{h}elo ad{h}esivo des{h}ielo co{h}ibir'
  ),
  g(
    4,
    'h',
    'La familia de palabras conserva la h: hacer → hecho, hielo → deshielo, huevo → huevera.',
    '{h}echo {h}uevera {h}ielera {h}abitante {h}abitación {h}erramienta {h}ospedaje {h}onrado'
  ),

  // ───────────────────────── 5.º ─────────────────────────
  g(
    5,
    'bv',
    'Las terminaciones -bilidad llevan b: posibilidad, responsabilidad (menos movilidad y civilidad).',
    'posi{b}ilidad responsa{b}ilidad disponi{b}ilidad sensi{b}ilidad flexi{b}ilidad ama{b}ilidad esta{b}ilidad'
  ),
  g(
    5,
    'bv',
    'Las terminaciones -bundo, -bunda llevan b: vagabundo, moribundo.',
    'vaga{b}undo mori{b}undo medita{b}undo'
  ),
  g(
    5,
    'bv',
    'Las palabras que empiezan con ob- y sub- llevan b: objeto, observar, subrayar.',
    'o{b}jeto o{b}servar o{b}tener su{b}rayar su{b}marino su{b}suelo o{b}stáculo su{b}terráneo'
  ),
  g(
    5,
    'bv',
    'Se escribe v: observar, conservar, reserva, curva, nervio.',
    'obser{v}ar conser{v}ar reser{v}a cur{v}a ner{v}io ser{v}icio sobre{v}ivir'
  ),
  g(
    5,
    'bv',
    'Las palabras que empiezan por vice- y viz- llevan v: vicepresidente, vizconde.',
    '{v}icepresidente {v}izconde {v}icealmirante'
  ),
  g(
    5,
    'bv',
    'Se escribe b: abril, absoluto, abdomen, obvio.',
    'a{b}ril a{b}soluto a{b}domen o{b}vio ha{b}itante a{b}undante'
  ),
  g(
    5,
    'gj',
    'Las palabras de la familia de generar y las que empiezan con legi- llevan g: genio, generoso, legible.',
    '{g}enio {g}eneroso {g}enética {g}eneración le{g}ible'
  ),
  g(
    5,
    'gj',
    'Las palabras terminadas en -gen llevan g: origen, imagen, virgen, margen.',
    'ori{g}en ima{g}en vir{g}en mar{g}en'
  ),
  g(
    5,
    'gj',
    'Se escribe j: hereje, ejercicio, ejemplo, ajedrez, ejército.',
    'here{j}e e{j}ercicio e{j}emplo a{j}edrez cerra{j}ería e{j}ército'
  ),
  g(
    5,
    'gj',
    'Se escribe g: ángel, gemido, página, ingenio, género.',
    'án{g}el {g}emido pá{g}ina in{g}enio in{g}eniero {g}énero'
  ),
  g(
    5,
    'csz',
    'Algunas palabras terminan en -sión con s: expresión, ilusión, extensión, televisión.',
    'expre{s}ión ilu{s}ión exten{s}ión confu{s}ión dimen{s}ión conclu{s}ión'
  ),
  g(
    5,
    'csz',
    'Se escribe c: cirugía, cenizas, circunferencia, cilindro, ciclista.',
    '{c}irugía {c}enizas {c}ircunferencia {c}ilindro {c}iclista {c}ientífico {c}emento'
  ),
  g(
    5,
    'csz',
    'Se escribe z: azúcar, gozar, lanzar, empezar, cruzar.',
    'a{z}úcar go{z}ar lan{z}ar empe{z}ar alcan{z}ar cru{z}ar abra{z}ar'
  ),
  g(
    5,
    'h',
    'Se escribe h: hemisferio, horizonte, hipopótamo, hidráulico, hexágono.',
    '{h}emisferio {h}orizonte {h}ipopótamo {h}idráulico {h}exágono {h}ábitat {h}emorragia'
  ),
  g(
    5,
    'h',
    'Las palabras compuestas de una con h conservan la h: deshacer, rehacer, inhabitable, prehistoria.',
    'des{h}acer re{h}acer in{h}abitable pre{h}istoria des{h}onesto in{h}umano re{h}ogar'
  ),
  g(
    5,
    'x',
    'Se escribe ex- delante de pr, pl, tr y otras letras: explicar, exprimir, extraño, exponer.',
    'e{x}plicar e{x}primir e{x}traño e{x}presar e{x}plorar e{x}tranjero e{x}poner e{x}tremo'
  ),
  g(
    5,
    'x',
    'Se escribe x: examen, exacto, excursión, texto, taxi, oxígeno.',
    'e{x}amen e{x}acto e{x}cursión e{x}posición te{x}to ta{x}i o{x}ígeno au{x}ilio'
  ),
  g(
    5,
    'lly',
    'Se escribe ll: pantalla, bombilla, tortilla, estrella, orilla.',
    'panta{ll}a bombi{ll}a ori{ll}a mantequi{ll}a pasti{ll}a cosqui{ll}a membri{ll}o ca{ll}ejón'
  ),
  g(
    5,
    'lly',
    'Se escribe y: reyes, leyes, mayoría, rayuela, ayuntamiento, cayado.',
    're{y}es le{y}es ma{y}oría ra{y}uela a{y}untamiento ca{y}ado'
  ),
  g(
    5,
    'mp',
    'Antes de p y b se escribe m, aunque la palabra sea larga: importante, imposible, embajada.',
    'i{m}portante i{m}posible e{m}bajada e{m}pleado co{m}petir e{m}barcar e{m}pujar co{m}puesto'
  ),

  // ───────────────────────── 6.º ─────────────────────────
  g(
    6,
    'bv',
    'Los verbos terminados en -buir llevan b: contribuir, distribuir, atribuir.',
    'contri{b}uir distri{b}uir atri{b}uir retri{b}uir'
  ),
  g(
    6,
    'bv',
    'Las terminaciones -bilidad y -bundo llevan b: probabilidad, estabilidad, vagabundo.',
    'proba{b}ilidad visi{b}ilidad vulnera{b}ilidad credi{b}ilidad'
  ),
  g(
    6,
    'bv',
    'Se escribe v: advertencia, vegetación, conversación, innovación, supervivencia.',
    'ad{v}ertencia {v}egetación con{v}ersación inno{v}ación supervi{v}encia reno{v}ación'
  ),
  g(
    6,
    'bv',
    'Se escribe b: absurdo, obstáculo, sublime, obstinado, subjetivo.',
    'a{b}surdo o{b}stáculo su{b}lime o{b}stinado su{b}jetivo '
  ),
  g(
    6,
    'bv',
    'Hay que recordarla con v: invertebrado, vertebrado, reivindicar, volcánico, vigilante.',
    'in{v}ertebrado {v}ertebrado rei{v}indicar {v}olcánico {v}igilante {v}ertiente {v}ersión'
  ),
  g(
    6,
    'gj',
    'Las palabras terminadas en -logía, -gía, -gener llevan g: ecología, biología, regeneración.',
    'ecolo{g}ía meteorolo{g}ía astrolo{g}ía arqueolo{g}ía re{g}eneración {g}enealogía'
  ),
  g(
    6,
    'gj',
    'Se escribe j: ojear (mirar rápido), hojear (pasar las hojas), brebaje.',
    'o{j}ear ho{j}ear breba{j}e'
  ),
  g(
    6,
    'gj',
    'Se escribe g: legislar, ingeniero, congelar, exigente, indígena, vigente.',
    'le{g}islar con{g}elar exi{g}ente indí{g}ena vi{g}ente re{g}ión'
  ),
  g(
    6,
    'gj',
    'Se escribe j: relojería, tejido, ajeno, bajeza, ojeriza.',
    'relo{j}ería te{j}ido a{j}eno ba{j}eza o{j}eriza'
  ),
  g(
    6,
    'csz',
    'Algunas palabras terminan en -sión: televisión, decisión, extensión. Otras en -ción: canción, atención.',
    'persua{s}ión suspen{s}ión compren{s}ión dimi{s}ión oca{s}ión'
  ),
  g(
    6,
    'csz',
    'Las palabras que terminan en -cia, -cio llevan c: gracia, vicio, silencio, democracia.',
    'gra{c}ia vi{c}io silen{c}io democra{c}ia farma{c}ia ofi{c}io sacrifi{c}io'
  ),
  g(
    6,
    'csz',
    'Se escribe z: razón, vez, hazaña, pizarra, aterrizar, organizar.',
    'ra{z}ón hazaña pi{z}arra aterri{z}ar organi{z}ar utili{z}ar anali{z}ar reali{z}ar'
  ),
  g(
    6,
    'x',
    'Se escribe x: extinto, exuberante, excelente, exclamación, exhausto.',
    'e{x}tinto e{x}uberante e{x}celente e{x}clamación e{x}hausto e{x}cepción'
  ),
  g(
    6,
    'x',
    'Se escribe x: sexto, máximo, próximo, léxico, oxidar, flexible.',
    'se{x}to má{x}imo pró{x}imo lé{x}ico o{x}idar fle{x}ible'
  ),
  g(
    6,
    'h',
    'Se escribe h: hipotenusa, hemisferio, herbívoro, heredero, honestidad.',
    '{h}ipotenusa {h}erbívoro {h}eredero {h}onestidad {h}ospitalidad {h}idratar {h}umildad'
  ),
  g(
    6,
    'h',
    'Se escribe h: exhalar, exhibición, inhóspito, adherir, rehén, alhajas.',
    'ex{h}alar ex{h}ibición in{h}óspito ad{h}erir re{h}én al{h}ajas'
  ),
  g(
    6,
    'lly',
    'Se escribe ll: bella, callado, millón, apellido, estrellado, bullicio.',
    'be{ll}a ca{ll}ado mi{ll}ón ape{ll}ido estre{ll}ado bu{ll}icio ca{ll}ejero'
  ),
  g(
    6,
    'lly',
    'Se escribe y: ayuda, proyecto, inyección, desayuno, subrayar, destruyó.',
    'a{y}uda pro{y}ecto in{y}ección desa{y}uno subra{y}ar'
  )
]
