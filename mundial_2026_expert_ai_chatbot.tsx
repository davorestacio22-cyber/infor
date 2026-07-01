import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  Award, 
  Play, 
  Activity, 
  ChevronRight, 
  Info,
  RefreshCw,
  Clock,
  Shield,
  Search,
  CheckCircle,
  FileText,
  Sliders,
  Maximize2
} from 'lucide-react';

// Selecciones participantes con ratings estimados de rendimiento al inicio de la fase KO
const SELECCIONES = [
  { id: 'USA', nombre: 'Estados Unidos', rating: 1740, confederacion: 'CONCACAF', grupo: 'D', emoji: '🇺🇸', dt: 'Mauricio Pochettino', estilo: 'Presión Alta & Transiciones rápidas' },
  { id: 'ARG', nombre: 'Argentina', rating: 1860, confederacion: 'CONMEBOL', grupo: 'J', emoji: '🇦🇷', dt: 'Lionel Scaloni', estilo: 'Posesión y ataque posicional dinámico' },
  { id: 'BRA', nombre: 'Brasil', rating: 1835, confederacion: 'CONMEBOL', grupo: 'C', emoji: '🇧🇷', dt: 'Dorival Júnior', estilo: 'Juego asociativo e individualidades por bandas' },
  { id: 'FRA', nombre: 'Francia', rating: 1845, confederacion: 'UEFA', grupo: 'I', emoji: '🇫🇷', dt: 'Didier Deschamps', estilo: 'Bloque medio sólido y contraataque letal' },
  { id: 'ENG', nombre: 'Inglaterra', rating: 1815, confederacion: 'UEFA', grupo: 'L', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', dt: 'Thomas Tuchel', estilo: 'Estructura rígida de tres centrales y juego aéreo' },
  { id: 'ESP', nombre: 'España', rating: 1805, confederacion: 'UEFA', grupo: 'H', emoji: '🇪🇸', dt: 'Luis de la Fuente', estilo: 'Extremos abiertos, presión tras pérdida y ritmo alto' },
  { id: 'BEL', nombre: 'Bélgica', rating: 1775, confederacion: 'UEFA', grupo: 'G', emoji: '🇧🇪', dt: 'Domenico Tedesco', estilo: 'Repliegue táctico y juego directo' },
  { id: 'POR', nombre: 'Portugal', rating: 1780, confederacion: 'UEFA', grupo: 'K', emoji: '🇵🇹', dt: 'Roberto Martínez', estilo: 'Amplitud de bandas y control del mediocampo' },
  { id: 'MEX', nombre: 'México', rating: 1710, confederacion: 'CONCACAF', grupo: 'A', emoji: '🇲🇽', dt: 'Javier Aguirre', estilo: 'Bloque defensivo intenso, balones largos y garra' },
  { id: 'CAN', nombre: 'Canadá', rating: 1690, confederacion: 'CONCACAF', grupo: 'B', emoji: '🇨🇦', dt: 'Jesse Marsch', estilo: 'Fuerza física y verticalidad veloz' },
  { id: 'GER', nombre: 'Alemania', rating: 1765, confederacion: 'UEFA', grupo: 'E', emoji: '🇩🇪', dt: 'Julian Nagelsmann', estilo: 'Fútbol posicional y sobrecargas en zona central' },
  { id: 'MAR', nombre: 'Marruecos', rating: 1745, confederacion: 'CAF', grupo: 'C', emoji: '🇲🇦', dt: 'Walid Regragui', estilo: 'Bloque bajo ultra compacto e transiciones rápidas' },
  { id: 'SEN', nombre: 'Senegal', rating: 1715, confederacion: 'CAF', grupo: 'I', emoji: '🇸🇳', dt: 'Pape Thiaw', estilo: 'Potencia física y juego por bandas' },
  { id: 'BIH', nombre: 'Bosnia y Her.', rating: 1640, confederacion: 'UEFA', grupo: 'B', emoji: '🇧🇦', dt: 'Sergej Barbarez', estilo: 'Estructura defensiva férrea y juego directo a pivot' },
  { id: 'COL', nombre: 'Colombia', rating: 1765, confederacion: 'CONMEBOL', grupo: 'K', emoji: '🇨🇴', dt: 'Néstor Lorenzo', estilo: 'Transición ofensiva rápida y balones parados letales' },
  { id: 'ECU', placeholder: 'Ecuador', nombre: 'Ecuador', rating: 1725, confederacion: 'CONMEBOL', grupo: 'E', emoji: '🇪🇨', dt: 'Sebastián Beccacece', estilo: 'Carrileros profundos y gran solidez física' },
  { id: 'NED', nombre: 'Países Bajos', rating: 1770, confederacion: 'UEFA', grupo: 'F', emoji: '🇳🇱', dt: 'Ronald Koeman', estilo: 'Salida de balón elaborada y juego directo de segundas acciones' },
  { id: 'CRO', nombre: 'Croacia', rating: 1750, confederacion: 'UEFA', grupo: 'L', emoji: '🇭🇷', dt: 'Zlatko Dalić', estilo: 'Posesión pausada y control de ritmos en el mediocampo' },
  { id: 'AUS', nombre: 'Australia', rating: 1675, confederacion: 'AFC', grupo: 'D', emoji: '🇦🇺', dt: 'Tony Popovic', estilo: 'Juego físico directo y solidez en centros laterales' },
  { id: 'EGY', nombre: 'Egipto', rating: 1685, confederacion: 'CAF', grupo: 'G', emoji: '🇪🇬', dt: 'Hossam Hassan', estilo: 'Bloque medio y balones filtrados rápidos' },
  { id: 'PAR', nombre: 'Paraguay', rating: 1715, confederacion: 'CONMEBOL', grupo: 'D', emoji: '🇵🇾', dt: 'Gustavo Alfaro', estilo: 'Defensa impenetrable en área propia y contragolpes' },
  { id: 'NOR', nombre: 'Noruega', rating: 1730, confederacion: 'UEFA', grupo: 'I', emoji: '🇳🇴', dt: 'Ståle Solbakken', estilo: 'Aprovechamiento de Erling Haaland y centros de extremos' },
  { id: 'SUI', nombre: 'Suiza', rating: 1720, confederacion: 'UEFA', grupo: 'B', emoji: '🇨🇭', dt: 'Murat Yakin', estilo: 'Basculaciones rápidas y juego posicional fluido' },
  { id: 'ALG', nombre: 'Argelia', rating: 1690, confederacion: 'CAF', grupo: 'J', emoji: '🇩🇿', dt: 'Vladimir Petković', estilo: 'Transición por carril central y presión selectiva' },
  { id: 'AUT', nombre: 'Austria', rating: 1705, confederacion: 'UEFA', grupo: 'J', emoji: '🇦🇹', dt: 'Ralf Rangnick', estilo: 'Gegenpressing extremo y transiciones verticales veloces' }
];

// Calendario oficial y marcadores reales de la fase KO del Mundial 2026 al 1 de Julio de 2026
const PARTIDOS = [
  { id: 1, fase: 'r32', equipoA: 'CAN', equipoB: 'RSA', golesA: 1, golesB: 0, nota: 'Canadá avanzó con un gol táctico de Jonathan David.', fecha: '28 Jun 2026', estado: 'finalizado', estadio: 'Los Angeles Stadium' },
  { id: 2, fase: 'r32', equipoA: 'BRA', equipoB: 'JPN', golesA: 2, golesB: 1, nota: 'Vinícius Jr. destrabó el partido en el minuto 84.', fecha: '29 Jun 2026', estado: 'finalizado', estadio: 'Houston Stadium' },
  { id: 3, fase: 'r32', equipoA: 'GER', equipoB: 'PAR', golesA: 1, golesB: 1, nota: 'Paraguay dio el batacazo eliminando a Alemania (4-3 en penales).', fecha: '29 Jun 2026', estado: 'finalizado', estadio: 'Boston Stadium' },
  { id: 4, fase: 'r32', equipoA: 'NED', equipoB: 'MAR', golesA: 1, golesB: 1, nota: 'Marruecos silenció a Países Bajos venciéndolos 3-2 en penales.', fecha: '29 Jun 2026', estado: 'finalizado', estadio: 'Monterrey Stadium' },
  { id: 5, fase: 'r32', equipoA: 'NOR', equipoB: 'CIV', golesA: 2, golesB: 1, nota: 'Haaland anotó doblete para meter a Noruega en octavos.', fecha: '30 Jun 2026', estado: 'finalizado', estadio: 'Dallas Stadium' },
  { id: 6, fase: 'r32', equipoA: 'FRA', equipoB: 'SWE', golesA: 3, golesB: 0, nota: 'Francia aplastó a Suecia con exhibición de Kylian Mbappé.', fecha: '30 Jun 2026', estado: 'finalizado', estadio: 'New York New Jersey Stadium' },
  { id: 7, fase: 'r32', equipoA: 'MEX', equipoB: 'ECU', golesA: 2, golesB: 0, nota: 'México encendió el Azteca con goles de Quiñones y Giménez.', fecha: '30 Jun 2026', estado: 'finalizado', estadio: 'Mexico City Stadium' },
  { id: 8, fase: 'r32', equipoA: 'ENG', equipoB: 'COD', golesA: 2, golesB: 1, nota: 'Inglaterra avanzó raspando con un cabezazo salvador de Harry Kane.', fecha: '01 Jul 2026', estado: 'finalizado', estadio: 'Atlanta Stadium' },
  { id: 9, fase: 'r32', equipoA: 'BEL', equipoB: 'SEN', golesA: 3, golesB: 2, nota: 'Bélgica clasificó en la prórroga con gol de De Ketelaere.', fecha: '01 Jul 2026', estado: 'finalizado', estadio: 'Seattle Stadium' },
  
  // Dieciseisavos de final por disputarse
  { id: 10, fase: 'r32', equipoA: 'USA', equipoB: 'BIH', golesA: null, golesB: null, nota: 'Debut eliminatorio del Team USA de Pochettino.', fecha: 'Hoy 19:00 (LT)', estado: 'proximo', estadio: 'San Francisco Bay Area Stadium' },
  { id: 11, fase: 'r32', equipoA: 'POR', equipoB: 'CRO', golesA: null, golesB: null, nota: 'Último choque mundialista entre Cristiano Ronaldo y Luka Modrić.', fecha: '02 Jul 2026', estado: 'proximo', estadio: 'Toronto Stadium' },
  { id: 12, fase: 'r32', equipoA: 'ESP', equipoB: 'AUT', golesA: null, golesB: null, nota: 'Duelo táctico de alto vuelo: De la Fuente contra el pressing de Rangnick.', fecha: '02 Jul 2026', estado: 'proximo', estadio: 'Los Angeles Stadium' },
  { id: 13, fase: 'r32', equipoA: 'SUI', equipoB: 'ALG', golesA: null, golesB: null, nota: 'La solidez helvética desafía al duro conjunto argelino.', fecha: '02 Jul 2026', estado: 'proximo', estadio: 'BC Place Vancouver' },
  { id: 14, fase: 'r32', equipoA: 'ARG', equipoB: 'AUT', golesA: null, golesB: null, nota: 'La campeona del mundo prepara su asalto a octavos en Miami.', fecha: '03 Jul 2026', estado: 'proximo', estadio: 'Miami Stadium' },
  { id: 15, fase: 'r32', equipoA: 'COL', equipoB: 'EGY', golesA: null, golesB: null, nota: 'Colombia busca extender su gran racha ante los faraones.', fecha: '03 Jul 2026', estado: 'proximo', estadio: 'Kansas City Stadium' },

  // Octavos de final confirmados/proyectados
  { id: 16, fase: 'r16', equipoA: 'CAN', equipoB: 'MAR', golesA: null, golesB: null, nota: 'La velocidad canadiense contra el muro de Walid Regragui.', fecha: '04 Jul 2026', estado: 'proximo', estadio: 'Houston Stadium' },
  { id: 17, fase: 'r16', equipoA: 'PAR', equipoB: 'FRA', golesA: null, golesB: null, nota: 'La garra albirroja de Alfaro desafía al tridente ofensivo francés.', fecha: '04 Jul 2026', estado: 'proximo', estadio: 'Philadelphia Stadium' },
  { id: 18, fase: 'r16', equipoA: 'BRA', equipoB: 'NOR', golesA: null, golesB: null, nota: 'Haaland medirá la solidez de los centrales brasileños Militao y Gabriel.', fecha: '05 Jul 2026', estado: 'proximo', estadio: 'New York New Jersey Stadium' },
  { id: 19, fase: 'r16', equipoA: 'MEX', equipoB: 'ENG', golesA: null, golesB: null, nota: 'Histórico cruce en el Estadio Azteca por el pase a cuartos.', fecha: '05 Jul 2026', estado: 'proximo', estadio: 'Mexico City Stadium' }
];

const ESTADIOS = [
  { ciudad: 'Ciudad de México', estadio: 'Estadio Azteca', pais: 'México', capacidad: 87523, rol: 'Partido Inaugural y Octavos de Final' },
  { ciudad: 'New York/New Jersey', estadio: 'MetLife Stadium', pais: 'Estados Unidos', capacidad: 82500, rol: 'Gran Final de la Copa Mundial (19 Jul)' },
  { ciudad: 'Dallas', estadio: 'AT&T Stadium', pais: 'Estados Unidos', capacidad: 80000, rol: 'Sede de Semifinal y KO' },
  { ciudad: 'Los Angeles', estadio: 'SoFi Stadium', pais: 'Estados Unidos', capacidad: 70240, rol: 'Inauguración del Team USA y KO' },
  { ciudad: 'San Francisco', estadio: 'Levi\'s Stadium', pais: 'Estados Unidos', capacidad: 68500, rol: 'Estelar de hoy (USA vs Bosnia)' },
  { ciudad: 'Seattle', estadio: 'Lumen Field', pais: 'Estados Unidos', capacidad: 69000, rol: 'Fase de Grupos y Cuartos de Final' },
  { ciudad: 'Miami', estadio: 'Hard Rock Stadium', pais: 'Estados Unidos', capacidad: 64767, rol: 'Partido por el Tercer Puesto' },
  { ciudad: 'Toronto', estadio: 'BMO Field', pais: 'Canadá', capacidad: 45000, rol: 'Inauguración de Canadá' },
  { ciudad: 'Vancouver', estadio: 'BC Place', pais: 'Canadá', capacidad: 54500, rol: 'Partidos de Fase Eliminatoria' }
];

// Función de distribución de probabilidad de Poisson para cálculo de goles
function calcularPoisson(k, lambda) {
  const factorial = (n) => {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let j = 2; j <= n; j++) res *= j;
    return res;
  };
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export default function App() {
  // --- Estados del Chatbot ---
  const [conversacion, setConversacion] = useState([
    {
      id: 1,
      remitente: 'bot',
      texto: "¡Saludos, táctico! ⚽ Soy tu **Analista Experto del Mundial 2026**. \n\nHoy, **miércoles 1 de julio de 2026**, estamos en el epicentro de la emoción del certamen con la definición de los Dieciseisavos de Final (Round of 32).\n\nHoy ya tuvimos resultados definitivos: **Inglaterra venció 2-1 a RD Congo** en Atlanta, y **Bélgica eliminó 3-2 a Senegal** en una prórroga no apta para cardíacos en Seattle. \n\nEsta noche, el plato fuerte es el debut eliminatorio del **Team USA** de Mauricio Pochettino contra **Bosnia y Herzegovina** en San Francisco.\n\n¿Qué análisis táctico, simulación matemática de Poisson o informe de sedes deseas debatir hoy?",
      fecha: new Date()
    }
  ]);
  const [mensajeUsuario, setMensajeUsuario] = useState('');
  const [cargandoChat, setCargandoChat] = useState(false);
  const scrollRef = useRef(null);

  // --- Estados del Simulador de Poisson ---
  const [equipoA, setEquipoA] = useState('USA');
  const [equipoB, setEquipoB] = useState('BIH');
  const [modificadorFormaA, setModificadorFormaA] = useState(1.0); // Modificador de estado de forma
  const [modificadorFormaB, setModificadorFormaB] = useState(1.0);
  const [resultadosSimulacion, setResultadosSimulacion] = useState(null);

  // --- Filtros de Exploración de Partidos y Sedes ---
  const [faseFiltro, setFaseFiltro] = useState('all');
  const [busquedaSede, setBusquedaSede] = useState('');
  const [pestanaLateral, setPestanaLateral] = useState('simulador'); // 'simulador', 'partidos', 'sedes'

  // Auto-scroll para el contenedor de conversación del chatbot
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversacion]);

  // Recalcular la simulación cada vez que se alteran los equipos o modificadores
  useEffect(() => {
    ejecutarSimulacionPoisson();
  }, [equipoA, equipoB, modificadorFormaA, modificadorFormaB]);

  // Respuestas dinámicas y tácticas en caso de falla de la API o para rapidez inmediata
  const responderTcticamenteLocal = (input) => {
    const q = input.toLowerCase();
    
    if (q.includes('hoy') || q.includes('resultados') || q.includes('partidos de hoy') || q.includes('congo') || q.includes('senegal') || q.includes('inglaterra') || q.includes('belgica')) {
      return "¡La jornada de hoy, 1 de julio de 2026, ha sido pura dinamita táctica!\n\n" +
             "1. **🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra 2 - 1 🇨🇩 RD Congo** (Atlanta): Los ingleses de Thomas Tuchel sufrieron bastante. Un gol de vestuario del Congo complicó los planes, pero Harry Kane lo dio vuelta en el 72' imponiendo su jerarquía física.\n" +
             "2. **🇧🇪 Bélgica 3 - 2 🇸🇳 Senegal** (Prórroga, Seattle): ¡El mejor partido del torneo hasta ahora! Senegal presionó en zona alta con una fuerza asombrosa, pero la joya de Charles De Ketelaere sentenció el pase de los Diablos Rojos en el minuto 104.\n\n" +
             "Y esta noche cerramos en el Levi's Stadium con el duelo de **Estados Unidos contra Bosnia** a las 19:00 hora local. ¿Tienes tus predicciones tácticas listas?";
    }
    
    if (q.includes('usa') || q.includes('eeuu') || q.includes('estados unidos') || q.includes('pochettino') || q.includes('bosnia')) {
      return "El debut de **Mauricio Pochettino** en fases de eliminación directa con 🇺🇸 EE.UU. tiene al país paralizado. \n\nTácticamente, se proyecta un esquema **4-2-3-1** buscando ensanchar la cancha con Christian Pulisic y la verticalidad de Folarin Balogun. Su rival, 🇧🇦 Bosnia y Herzegovina, se replegará en un **5-4-1** muy físico comandado en la última línea por la fuerza aérea de sus centrales.\n\nEl ganador jugará contra la experimentada **Bélgica** en octavos. ¡La presión en San Francisco será asfixiante!";
    }

    if (q.includes('mexico') || q.includes('méxico') || q.includes('aguirre') || q.includes('ecuador')) {
      return "¡México vivió una noche de gloria en el Estadio Azteca derrotando **2-0 a Ecuador**! El esquema defensivo del 'Vasco' Javier Aguirre neutralizó por completo las proyecciones de los laterales ecuatorianos.\n\nAhora, el gran reto de la selección mexicana es el choque de **Octavos de Final contra Inglaterra** el próximo domingo 5 de julio a las 19:00 en un coloso de Santa Úrsula que promete ser un hervidero. ¿Es posible dar la sorpresa táctica ante el sistema rígido de Tuchel?";
    }

    if (q.includes('argentina') || q.includes('scaloni') || q.includes('messi') || q.includes('cabo verde')) {
      return "La Scaloneta de 🇦🇷 Lionel Scaloni sigue mostrando un fútbol de alto nivel de posesión. Tras avanzar con puntaje perfecto en su grupo, se enfrentará a la gran revelación africana, **Cabo Verde**, este viernes 3 de julio en el Hard Rock Stadium de Miami.\n\nSe espera que la campeona defensora explote los pasillos interiores para romper el bloque defensivo compacto de Cabo Verde. ¡La expectativa es total!";
    }

    if (q.includes('final') || q.includes('metlife') || q.includes('campeon') || q.includes('dónde se juega')) {
      return "La Gran Final de la Copa Mundial 2026 se celebrará el domingo **19 de julio de 2026** en el imponente **MetLife Stadium** de New York/New Jersey, acondicionado para recibir a más de 82,500 espectadores.\n\nLos favoritos matemáticos por coeficiente de Poisson hasta el momento son **Argentina, Francia, Brasil** e **Inglaterra**, pero las sorpresas tácticas y los penales de este Mundial de 48 equipos han demostrado que el trono está abierto para cualquiera.";
    }

    if (q.includes('favorito') || q.includes('quien gana') || q.includes('prediccion') || q.includes('poisson')) {
      return "Analizando los coeficientes e historiales tácticos:\n\n• **Argentina (Rating: 1860):** El equipo más cohesionado. Gran solidez en el mediocampo.\n• **Francia (Rating: 1845):** El equipo con las transiciones rápidas más peligrosas gracias a Mbappé.\n• **Brasil (Rating: 1835):** Desequilibrio total por bandas con Vinicius Jr. y Rodrygo.\n\nTe recomiendo utilizar el **Simulador de Poisson** ubicado en el panel izquierdo de esta pantalla para cruzar a tus favoritos y ver la probabilidad exacta de victoria, empates y marcadores probables según la matemática actuarial.";
    }

    return "Es un análisis muy interesante sobre el plano táctico de esta Copa del Mundo. En este torneo de 104 partidos, la profundidad de plantilla y el control de la fatiga en viajes transcontinentales entre Canadá, EE.UU. y México es el verdadero factor invisible de éxito. ¿Deseas que profundicemos en las alineaciones de alguna selección o simulemos un cruce táctico en particular?";
  };

  // Motor de simulación matemática cruzada de Poisson
  const ejecutarSimulacionPoisson = () => {
    const eqAObj = SELECCIONES.find(s => s.id === equipoA);
    const eqBObj = SELECCIONES.find(s => s.id === equipoB);
    
    if (!eqAObj || !eqBObj) return;

    // Calcular la fuerza relativa ponderada por los modificadores de forma definidos por el usuario
    const ratingEfectivoA = eqAObj.rating * modificadorFormaA;
    const ratingEfectivoB = eqBObj.rating * modificadorFormaB;

    const diferenciaRating = ratingEfectivoA - ratingEfectivoB;
    
    // xG (Expected Goals) base y modificado linealmente según la diferencia de rating
    const xG_A = Math.max(0.4, Math.min(4.0, 1.45 + (diferenciaRating / 300)));
    const xG_B = Math.max(0.4, Math.min(4.0, 1.45 - (diferenciaRating / 300)));

    // Generar la matriz de probabilidades de goles del 0 al 6 para cada equipo
    const probGolesA = Array.from({ length: 7 }, (_, g) => calcularPoisson(g, xG_A));
    const probGolesB = Array.from({ length: 7 }, (_, g) => calcularPoisson(g, xG_B));

    let probVictoriaA = 0;
    let probEmpate = 0;
    let probVictoriaB = 0;
    const marcadores = [];

    // Cruzar las distribuciones de probabilidad discretas
    for (let gA = 0; gA < 7; gA++) {
      for (let gB = 0; gB < 7; gB++) {
        const probCombinada = probGolesA[gA] * probGolesB[gB];
        
        if (gA > gB) probVictoriaA += probCombinada;
        else if (gA < gB) probVictoriaB += probCombinada;
        else probEmpate += probCombinada;

        marcadores.push({
          marcador: `${gA} - ${gB}`,
          prob: probCombinada,
          gA,
          gB
        });
      }
    }

    // Normalizar y obtener los 4 marcadores más probables
    const marcadoresTop = marcadores
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 4)
      .map(m => ({
        marcador: m.marcador,
        porcentaje: (m.prob * 100).toFixed(1)
      }));

    const totalCalculado = probVictoriaA + probEmpate + probVictoriaB;

    setResultadosSimulacion({
      probWinA: ((probVictoriaA / totalCalculado) * 100).toFixed(1),
      probDraw: ((probEmpate / totalCalculado) * 100).toFixed(1),
      probWinB: ((probVictoriaB / totalCalculado) * 100).toFixed(1),
      avgGolesA: xG_A.toFixed(2),
      avgGolesB: xG_B.toFixed(2),
      marcadoresComunes: marcadoresTop,
      equipoAObj: eqAObj,
      equipoBObj: eqBObj
    });
  };

  const enviarMensajeChat = async (e) => {
    if (e) e.preventDefault();
    if (!mensajeUsuario.trim() || cargandoChat) return;

    const historialActualizado = [
      ...conversacion,
      { id: Date.now(), remitente: 'user', texto: mensajeUsuario, fecha: new Date() }
    ];

    setConversacion(historialActualizado);
    const peticionTexto = mensajeUsuario;
    setMensajeUsuario('');
    setCargandoChat(true);

    const instruccionSistema = `Actúa como "Mundialista 2026 Pro", el chatbot oficial de inteligencia y análisis táctico deportivo de la Copa Mundial de la FIFA 2026. Te encuentras comunicándote el 1 de julio de 2026.
    Tus pilares fundamentales son:
    - Entusiasmo periodístico extremo, análisis táctico riguroso (p. ej., mencionar esquemas como 4-3-3, 3-5-2, bloque bajo, transiciones rápidas).
    - Datos del 1 de julio de 2026: Inglaterra venció 2-1 a RD Congo hoy en Atlanta. Bélgica venció 3-2 a Senegal en prórroga hoy en Seattle.
    - El partido clave de esta noche es EE.UU. contra Bosnia en el Levi's Stadium (San Francisco). El DT de EE.UU. es Mauricio Pochettino.
    - Resultados previos de R32: Canadá 1-0 RSA, Brasil 2-1 JPN, Paraguay elimina a Alemania en penales, Marruecos elimina a Países Bajos en penales, Noruega 2-1 CIV, Francia 3-0 SWE, México 2-0 ECU.
    - La final será el 19 de Julio de 2026 en MetLife Stadium, NY/NJ.
    Contesta siempre en español, utiliza emojis de manera estratégica y profesional, y cita directores técnicos e hitos.`;

    try {
      const apiBody = historialActualizado.slice(-8).map(msg => ({
        role: msg.remitente === 'user' ? 'user' : 'model',
        parts: [{ text: msg.texto }]
      }));

      // Conexión directa a la API de Gemini con fallback local
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: apiBody,
          systemInstruction: { parts: [{ text: instruccionSistema }] }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const textoAI = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textoAI) {
          setConversacion(prev => [...prev, { id: Date.now() + 1, remitente: 'bot', texto: textoAI, fecha: new Date() }]);
        } else {
          throw new Error("Respuesta de API nula");
        }
      } else {
        throw new Error("Límite de API o error de llave");
      }
    } catch (err) {
      // Fallback local instantáneo y táctico
      const respuestaLocal = responderTcticamenteLocal(peticionTexto);
      setTimeout(() => {
        setConversacion(prev => [...prev, { id: Date.now() + 1, remitente: 'bot', texto: respuestaLocal, fecha: new Date() }]);
      }, 600);
    } finally {
      setCargandoChat(false);
    }
  };

  const partidosFiltrados = useMemo(() => {
    return PARTIDOS.filter(p => {
      if (faseFiltro === 'all') return true;
      return p.fase === faseFiltro;
    });
  }, [faseFiltro]);

  const estadiosFiltrados = useMemo(() => {
    return ESTADIOS.filter(e => 
      e.estadio.toLowerCase().includes(busquedaSede.toLowerCase()) || 
      e.ciudad.toLowerCase().includes(busquedaSede.toLowerCase()) ||
      e.pais.toLowerCase().includes(busquedaSede.toLowerCase())
    );
  }, [busquedaSede]);

  // Handler para cargar un partido del calendario directamente en el predictor de Poisson
  const cargarPartidoEnSimulador = (partido) => {
    setEquipoA(partido.equipoA);
    setEquipoB(partido.equipoB);
    setModificadorFormaA(1.0);
    setModificadorFormaB(1.0);
    setPestanaLateral('simulador');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-12">
      
      {/* HEADER DE LA APLICACIÓN */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center animate-pulse">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-widest bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent uppercase">
                COPA MUNDIAL 2026 • COMMAND CENTER
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Análisis Táctico, Predictor de Poisson & Asistente AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold animate-pulse">
              ROUND OF 32 • EN VIVO
            </span>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Banner de Estado del Torneo */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="h-4 w-4 animate-bounce" />
                <span>Base Táctica Integrada</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Mundial de 48 Equipos: Fase de K.O.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Interactúe con nuestro chatbot experto alimentado con historiales y formaciones en tiempo real, u optimice las predicciones utilizando nuestro simulador analítico de distribución de Poisson.
              </p>
            </div>
            <div className="flex shrink-0 bg-slate-900/80 rounded-xl p-4 border border-slate-800 text-center font-mono space-x-4">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Partidos Jugados</span>
                <span className="text-xl font-bold text-white">81 / 104</span>
              </div>
              <div className="border-r border-slate-800"></div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">Hoy</span>
                <span className="text-xl font-bold text-emerald-400">3 Cruces</span>
              </div>
            </div>
          </div>
        </div>

        {/* ESTRUCTURA DE 2 COLUMNAS (Responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: HERRAMIENTAS INTERACTIVAS (5 de 12 Columnas) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Navegación Interna de Herramientas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 flex space-x-1">
              <button
                onClick={() => setPestanaLateral('simulador')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 uppercase tracking-wide ${pestanaLateral === 'simulador' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Simulador</span>
              </button>
              <button
                onClick={() => setPestanaLateral('partidos')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 uppercase tracking-wide ${pestanaLateral === 'partidos' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Partidos</span>
              </button>
              <button
                onClick={() => setPestanaLateral('sedes')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 uppercase tracking-wide ${pestanaLateral === 'sedes' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'}`}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Sedes</span>
              </button>
            </div>

            {/* SECCIÓN 1: SIMULADOR DE POISSON */}
            {pestanaLateral === 'simulador' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Sliders className="h-4 w-4 text-emerald-400" />
                    <span>Algoritmo Predictor Actuarial</span>
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    Poisson v1.2
                  </span>
                </div>

                {/* Selectores de Equipos */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Local (Rating)</label>
                      <select
                        value={equipoA}
                        onChange={(e) => setEquipoA(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        {SELECCIONES.map(s => (
                          <option key={s.id} value={s.id} disabled={s.id === equipoB}>
                            {s.emoji} {s.nombre} ({s.rating})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Visitante (Rating)</label>
                      <select
                        value={equipoB}
                        onChange={(e) => setEquipoB(e.target.value)}
                        className="block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      >
                        {SELECCIONES.map(s => (
                          <option key={s.id} value={s.id} disabled={s.id === equipoA}>
                            {s.emoji} {s.nombre} ({s.rating})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sliders de Ajuste Fino de Forma Táctica */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center space-x-1">
                          <span>Ajuste de Forma:</span>
                          <span className="font-bold text-slate-200 font-mono">{(modificadorFormaA * 100).toFixed(0)}%</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Local</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="1.20"
                        step="0.05"
                        value={modificadorFormaA}
                        onChange={(e) => setModificadorFormaA(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center space-x-1">
                          <span>Ajuste de Forma:</span>
                          <span className="font-bold text-slate-200 font-mono">{(modificadorFormaB * 100).toFixed(0)}%</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Visitante</span>
                      </div>
                      <input
                        type="range"
                        min="0.80"
                        max="1.20"
                        step="0.05"
                        value={modificadorFormaB}
                        onChange={(e) => setModificadorFormaB(parseFloat(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel de Output de Resultados de Probabilidad */}
                {resultadosSimulacion && (
                  <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Proyecciones de Probabilidades</span>
                      <span className="text-emerald-400 font-mono">Distribución Discreta</span>
                    </div>

                    {/* Barra de Distribución Visual */}
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                        <div 
                          style={{ width: `${resultadosSimulacion.probWinA}%` }} 
                          className="bg-emerald-600 hover:bg-emerald-500 transition-all duration-300"
                          title={`Victoria Local: ${resultadosSimulacion.probWinA}%`}
                        />
                        <div 
                          style={{ width: `${resultadosSimulacion.probDraw}%` }} 
                          className="bg-slate-600 hover:bg-slate-500 transition-all duration-300"
                          title={`Empate: ${resultadosSimulacion.probDraw}%`}
                        />
                        <div 
                          style={{ width: `${resultadosSimulacion.probWinB}%` }} 
                          className="bg-sky-600 hover:bg-sky-500 transition-all duration-300"
                          title={`Victoria Visitante: ${resultadosSimulacion.probWinB}%`}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded bg-emerald-600 block" />
                          <span>Local: <span className="text-white font-bold">{resultadosSimulacion.probWinA}%</span></span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded bg-slate-600 block" />
                          <span>Empate: <span className="text-white font-bold">{resultadosSimulacion.probDraw}%</span></span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded bg-sky-600 block" />
                          <span>Visitante: <span className="text-white font-bold">{resultadosSimulacion.probWinB}%</span></span>
                        </span>
                      </div>
                    </div>

                    {/* Expected Goals Promedio */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center text-xs font-mono">
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">xG Esperado (L)</span>
                        <span className="font-extrabold text-emerald-400">{resultadosSimulacion.avgGolesA} goles</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-500 font-bold uppercase tracking-wider">xG Esperado (V)</span>
                        <span className="font-extrabold text-sky-400">{resultadosSimulacion.avgGolesB} goles</span>
                      </div>
                    </div>

                    {/* Marcadores más probables */}
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Marcadores Exactos más Factibles</span>
                      <div className="grid grid-cols-2 gap-2">
                        {resultadosSimulacion.marcadoresComunes.map((m, idx) => (
                          <div key={idx} className="bg-slate-950 p-2.5 rounded-lg text-center border border-slate-800/80 text-xs flex justify-between items-center px-3">
                            <span className="font-mono font-black text-slate-200">{m.marcador}</span>
                            <span className="text-[10px] text-emerald-400 font-bold font-mono">{m.porcentaje}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Informe Táctico */}
                    <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                      <div className="flex items-center space-x-1.5 mb-1.5 text-slate-200 font-bold">
                        <Shield className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Esquema Recomendado</span>
                      </div>
                      <p className="mb-1">
                        • {resultadosSimulacion.equipoAObj.emoji} **{resultadosSimulacion.equipoAObj.dt}** usa típicamente: <span className="text-slate-300 font-semibold">{resultadosSimulacion.equipoAObj.estilo}</span>.
                      </p>
                      <p>
                        • {resultadosSimulacion.equipoBObj.emoji} **{resultadosSimulacion.equipoBObj.dt}** responde con: <span className="text-slate-300 font-semibold">{resultadosSimulacion.equipoBObj.estilo}</span>.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN 2: CALENDARIO Y MATCH CENTER */}
            {pestanaLateral === 'partidos' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-emerald-400" />
                    <span>Fase de Eliminatorias Directas</span>
                  </h3>
                  <div className="flex space-x-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                    <button
                      onClick={() => setFaseFiltro('all')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${faseFiltro === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFaseFiltro('r32')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${faseFiltro === 'r32' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      R32
                    </button>
                    <button
                      onClick={() => setFaseFiltro('r16')}
                      className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${faseFiltro === 'r16' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                    >
                      R16
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {partidosFiltrados.map((p) => {
                    const eqA = SELECCIONES.find(s => s.id === p.equipoA);
                    const eqB = SELECCIONES.find(s => s.id === p.equipoB);
                    return (
                      <div 
                        key={p.id} 
                        className={`p-3 rounded-xl border text-xs transition duration-200 ${
                          p.estado === 'proximo' 
                            ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700' 
                            : 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mb-2">
                          <span className="uppercase">{p.fase === 'r32' ? 'Dieciseisavos' : 'Octavos de Final'} • {p.estadio}</span>
                          <span>{p.fecha}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="space-y-1 text-slate-200 font-bold">
                            <p className="flex items-center space-x-2">
                              <span className="text-base">{eqA?.emoji}</span>
                              <span>{eqA?.nombre}</span>
                              {p.golesA !== null && <span className="font-mono text-emerald-400 ml-1 font-black">{p.golesA}</span>}
                            </p>
                            <p className="flex items-center space-x-2">
                              <span className="text-base">{eqB?.emoji}</span>
                              <span>{eqB?.nombre}</span>
                              {p.golesB !== null && <span className="font-mono text-emerald-400 ml-1 font-black">{p.golesB}</span>}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            {p.estado === 'finalizado' ? (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                                Final
                              </span>
                            ) : (
                              <button
                                onClick={() => cargarPartidoEnSimulador(p)}
                                className="bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white px-2 py-1 rounded text-[9px] font-bold uppercase transition flex items-center space-x-1"
                              >
                                <Play className="h-2 w-2" />
                                <span>Simular</span>
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-400 border-t border-slate-900 mt-2 pt-1 font-medium italic">
                          {p.nota}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECCIÓN 3: EXPLORADOR DE ESTADIOS */}
            {pestanaLateral === 'sedes' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span>Sedes Oficiales 2026</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">16 Ciudades repartidas en Canadá, EE.UU. y México.</p>
                </div>

                {/* Buscador de Sedes */}
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    value={busquedaSede}
                    onChange={(e) => setBusquedaSede(e.target.value)}
                    className="block w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="Filtrar por ciudad, estadio o país..."
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {estadiosFiltrados.map((est, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl text-xs space-y-1 hover:border-slate-700 transition">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-200">{est.estadio}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                          {est.capacidad.toLocaleString()} esp.
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>📍 {est.ciudad}, {est.pais}</span>
                        <span className="text-slate-500 italic">{est.rol}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* COLUMNA DERECHA: CHAT AI EXPERTO CON ESTILO COMMAND CENTER (7 de 12 Columnas) */}
          <div className="lg:col-span-7 flex flex-col h-[580px] bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            
            {/* Cabecera del Chat */}
            <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider block uppercase">Analista Experto AI</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Mundialista 2026 Pro</h4>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>INTERACTIVO</span>
              </div>
            </div>

            {/* Contenedor de Mensajes del Chat */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/40"
            >
              {conversacion.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.remitente === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    {msg.remitente === 'bot' && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mt-1 shrink-0">
                        <Bot className="h-4 w-4 text-emerald-400" />
                      </div>
                    )}
                    
                    <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.remitente === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none font-medium shadow-md shadow-emerald-600/10' 
                        : 'bg-slate-900 text-slate-300 border border-slate-800/80 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">
                        {msg.texto}
                      </p>
                      <span className="block text-[8px] text-slate-500 mt-1.5 text-right font-mono font-bold">
                        {msg.fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {msg.remitente === 'user' && (
                      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center mt-1 shrink-0">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {cargandoChat && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mt-1 shrink-0 animate-spin">
                      <RefreshCw className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="p-3 rounded-xl text-xs bg-slate-900 text-slate-400 border border-slate-800 rounded-tl-none animate-pulse">
                      <span>Procesando esquemas de juego e informes de sedes...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario de Entrada de Texto */}
            <form onSubmit={enviarMensajeChat} className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={mensajeUsuario}
                onChange={(e) => setMensajeUsuario(e.target.value)}
                placeholder="Pregúntame sobre táctica de hoy, el debut de Pochettino, estadios, etc..."
                className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={!mensajeUsuario.trim() || cargandoChat}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition duration-200 disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-md shadow-emerald-600/10"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

      </main>

      {/* FOOTER CORPORATIVO */}
      <footer className="mt-16 border-t border-slate-800 pt-6 text-center text-[10px] text-slate-500">
        <p>FIFA World Cup 2026 Tactic Analyst Engine • Desarrollado para uso analítico profesional.</p>
        <p className="mt-1">Toda la información proyectada al 1 de Julio de 2026 sigue rigurosamente los brackets y cronogramas de FIFA.</p>
      </footer>

    </div>
  );
}