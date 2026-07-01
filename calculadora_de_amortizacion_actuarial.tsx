import React, { useState, useMemo, useEffect } from 'react';
import { 
  Percent, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Layers, 
  HelpCircle, 
  Plus, 
  Trash2, 
  Download, 
  ArrowRight,
  Info,
  CheckCircle,
  BarChart2,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // --- Estados Principales ---
  const [monto, setMonto] = useState(100000);
  const [plazo, setPlazo] = useState(12);
  const [plazoTipo, setPlazoTipo] = useState('meses'); // 'meses' o 'años'
  const [tasaValor, setTasaValor] = useState(15);
  const [tipoTasa, setTipoTasa] = useState('TEA'); // 'TEA' o 'TNA'
  const [sistema, setSistema] = useState('frances'); // 'frances', 'aleman', 'americano'
  
  // Costos actuariales/adicionales
  const [seguroDesgravamen, setSeguroDesgravamen] = useState(0.05); // % sobre saldo mensual
  const [tipoSeguro, setTipoSeguro] = useState('saldo'); // 'saldo' o 'fijo'
  const [comisionFija, setComisionFija] = useState(10); // Monto fijo por cuota
  
  // Pagos extraordinarios
  const [pagosExtraordinarios, setPagosExtraordinarios] = useState([]);
  const [nuevoPagoMes, setNuevoPagoMes] = useState(1);
  const [nuevoPagoMonto, setNuevoPagoMonto] = useState(5000);
  const [nuevoPagoAccion, setNuevoPagoAccion] = useState('plazo'); // 'plazo' (reducir tiempo) o 'cuota' (reducir pago)

  // Control de pestañas del Dashboard
  const [pestanaActiva, setPestanaActiva] = useState('tabla'); // 'tabla', 'analisis', 'comparativo'
  
  // Estado para modal informativo/ayuda actuarial
  const [verAyuda, setVerAyuda] = useState(false);

  // --- Conversiones de Plazo y Tasas ---
  const periodosTotales = useMemo(() => {
    return plazoTipo === 'años' ? plazo * 12 : plazo;
  }, [plazo, plazoTipo]);

  const tasaEfectivaMensual = useMemo(() => {
    const tasaDecimal = tasaValor / 100;
    if (tipoTasa === 'TEA') {
      // TEM = (1 + TEA)^(1/12) - 1
      return Math.pow(1 + tasaDecimal, 1 / 12) - 1;
    } else {
      // TNA con capitalización mensual: TEM = TNA / 12
      return tasaDecimal / 12;
    }
  }, [tasaValor, tipoTasa]);

  // --- Motor de Generación del Cronograma ---
  const cronograma = useMemo(() => {
    let saldoPendiente = monto;
    const schedule = [];
    const n = periodosTotales;
    const i = tasaEfectivaMensual;

    // Crear mapa de pagos extraordinarios para acceso rápido
    const extrasMap = {};
    pagosExtraordinarios.forEach(p => {
      extrasMap[p.mes] = { monto: p.monto, accion: p.accion };
    });

    // Variables de control dinámico por si se reduce cuota o plazo
    let cuotaBaseFrances = 0;
    if (i > 0) {
      cuotaBaseFrances = (monto * i) / (1 - Math.pow(1 + i, -n));
    } else {
      cuotaBaseFrances = monto / n;
    }

    let amortizacionBaseAlemana = monto / n;
    let cuotasRestantes = n;

    for (let mes = 1; mes <= n; mes++) {
      if (saldoPendiente <= 0.01) break;

      // 1. Cálculo de Interés del periodo
      const interes = saldoPendiente * i;
      let amortizacion = 0;
      let cuotaFinanciera = 0;

      // 2. Cálculo según Sistema
      if (sistema === 'frances') {
        // Cuota = Interés + Amortización (Constante bajo condiciones normales)
        cuotaFinanciera = cuotaBaseFrances;
        // Si la cuota calculada supera el saldo restante más su interés
        if (cuotaFinanciera > saldoPendiente + interes) {
          cuotaFinanciera = saldoPendiente + interes;
        }
        amortizacion = cuotaFinanciera - interes;
      } 
      else if (sistema === 'aleman') {
        // Amortización constante
        amortizacion = amortizacionBaseAlemana;
        if (amortizacion > saldoPendiente) {
          amortizacion = saldoPendiente;
        }
        cuotaFinanciera = amortizacion + interes;
      } 
      else if (sistema === 'americano') {
        // Solo intereses, capital se paga al final
        if (mes === n) {
          amortizacion = saldoPendiente;
        } else {
          amortizacion = 0;
        }
        cuotaFinanciera = amortizacion + interes;
      }

      // 3. Costos Adicionales Actuariales
      const seguro = tipoSeguro === 'saldo' 
        ? saldoPendiente * (seguroDesgravamen / 100) 
        : monto * (seguroDesgravamen / 100);
      
      const comision = comisionFija;
      const cuotaTotalSinPrepagar = cuotaFinanciera + seguro + comision;

      // 4. Procesamiento de Pago Extraordinario (Prepago)
      let prepagoEfectivo = 0;
      let accionPrepago = null;

      if (extrasMap[mes]) {
        const prepagoPlanificado = extrasMap[mes].monto;
        accionPrepago = extrasMap[mes].accion;
        // No se puede prepagar más del saldo vivo posterior a la amortización ordinaria
        const saldoPostAmortizacion = saldoPendiente - amortizacion;
        prepagoEfectivo = Math.min(prepagoPlanificado, saldoPostAmortizacion);
      }

      const totalAmortizadoPeriodo = amortizacion + prepagoEfectivo;
      const saldoFinal = Math.max(0, saldoPendiente - totalAmortizadoPeriodo);
      const cuotaTotalConPrepagos = cuotaTotalSinPrepagar + prepagoEfectivo;

      schedule.push({
        mes,
        saldoInicial: saldoPendiente,
        interes,
        amortizacion,
        seguro,
        comision,
        cuotaFinanciera,
        cuotaTotal: cuotaTotalConPrepagos,
        prepago: prepagoEfectivo,
        accionPrepago,
        saldoFinal
      });

      // Actualizar saldo para el siguiente bucle
      saldoPendiente = saldoFinal;
      cuotasRestantes--;

      // 5. Recalcular parámetros del sistema si hubo un prepago y quedan periodos
      if (prepagoEfectivo > 0 && saldoFinal > 0 && cuotasRestantes > 0) {
        if (accionPrepago === 'cuota') {
          // Reducción de cuota: Se recalcula la cuota para los meses restantes manteniendo el plazo original
          if (sistema === 'frances') {
            if (i > 0) {
              cuotaBaseFrances = (saldoFinal * i) / (1 - Math.pow(1 + i, -cuotasRestantes));
            } else {
              cuotaBaseFrances = saldoFinal / cuotasRestantes;
            }
          } else if (sistema === 'aleman') {
            amortizacionBaseAlemana = saldoFinal / cuotasRestantes;
          }
        } 
        // Si es 'plazo', la cuota base se mantiene igual (lo que naturalmente acorta el cronograma en las siguientes iteraciones)
      }
    }

    return schedule;
  }, [monto, periodosTotales, tasaEfectivaMensual, sistema, seguroDesgravamen, tipoSeguro, comisionFija, pagosExtraordinarios]);

  // --- Resumen Métrico ---
  const resumen = useMemo(() => {
    let totalInteres = 0;
    let totalSeguro = 0;
    let totalComisiones = 0;
    let totalPagado = 0;
    let totalPrepagos = 0;

    cronograma.forEach(c => {
      totalInteres += c.interes;
      totalSeguro += c.seguro;
      totalComisiones += c.comision;
      totalPagado += c.cuotaTotal;
      totalPrepagos += c.prepago;
    });

    // Duración real (por si los prepagos acortaron el plazo)
    const duracionReal = cronograma.length;

    // Relación de Eficiencia del Pago (Monto original / Total pagado sin prepagos voluntarios directos)
    // Nos dice cuánto del dinero devuelto se fue a capital
    const pagadoOrdinario = totalPagado - totalPrepagos;
    const ratioEficiencia = pagadoOrdinario > 0 ? (monto / pagadoOrdinario) * 100 : 0;

    return {
      totalInteres,
      totalSeguro,
      totalComisiones,
      totalPagado,
      totalPrepagos,
      duracionReal,
      ratioEficiencia
    };
  }, [cronograma, monto]);

  // --- Algoritmo de Cálculo del Costo Financiero Total (CFT/TIR) ---
  // El CFT representa la tasa interna de retorno (TIR) mensual anualizada de los flujos de fondos del crédito.
  // Flujo: Desembolso en mes 0 (+Monto), y salidas mensuales en cada cuota (-CuotaTotal)
  const cftAnual = useMemo(() => {
    if (cronograma.length === 0) return 0;

    const flujos = [-monto];
    cronograma.forEach(c => {
      // Para el cálculo de la tasa de costo real, excluimos los prepagos voluntarios
      // a fin de reflejar el costo inherente diseñado de la operación bajo amortización normal
      flujos.push(c.cuotaTotal - c.prepago);
    });

    // Método de Secante para encontrar el cero del Polinomio de Flujo Neto Actuarial (TIR)
    const calcularVAN = (r) => {
      let van = flujos[0];
      for (let t = 1; t < flujos.length; t++) {
        van += flujos[t] / Math.pow(1 + r, t);
      }
      return van;
    };

    let r0 = 0.01; // Tasa semilla 1
    let r1 = 0.02; // Tasa semilla 2
    let maxIteraciones = 100;
    let tolerancia = 0.000001;
    let tirMensual = 0;

    for (let iter = 0; iter < maxIteraciones; iter++) {
      const van0 = calcularVAN(r0);
      const van1 = calcularVAN(r1);

      if (Math.abs(van1 - van0) < tolerancia) {
        tirMensual = r1;
        break;
      }

      const rSiguiente = r1 - van1 * (r1 - r0) / (van1 - van0);
      r0 = r1;
      r1 = rSiguiente;

      if (Math.abs(van1) < tolerancia) {
        tirMensual = r1;
        break;
      }
      tirMensual = r1;
    }

    // Convertir TIR mensual a Costo Financiero Total Efectivo Anual (CFTEA)
    // CFTEA = (1 + tirMensual)^12 - 1
    const cftea = Math.pow(1 + tirMensual, 12) - 1;
    return isNaN(cftea) || cftea < 0 ? 0 : cftea * 100;
  }, [monto, cronograma]);

  // --- Análisis Comparativo Teórico-Práctico de Sistemas ---
  const comparativaSistemas = useMemo(() => {
    // Generar simulaciones silenciosas para los otros sistemas usando mismos parámetros
    const calcularParaSistema = (sys) => {
      let saldoPendiente = monto;
      let totalI = 0;
      let totalS = 0;
      let totalC = 0;
      const n = periodosTotales;
      const i = tasaEfectivaMensual;
      let cuotaFrances = i > 0 ? (monto * i) / (1 - Math.pow(1 + i, -n)) : monto / n;
      const amortAleman = monto / n;

      for (let mes = 1; mes <= n; mes++) {
        const interes = saldoPendiente * i;
        let amortizacion = 0;
        
        if (sys === 'frances') {
          const cuotaFin = Math.min(cuotaFrances, saldoPendiente + interes);
          amortizacion = cuotaFin - interes;
        } else if (sys === 'aleman') {
          amortizacion = Math.min(amortAleman, saldoPendiente);
        } else if (sys === 'americano') {
          amortizacion = mes === n ? saldoPendiente : 0;
        }

        const seguro = tipoSeguro === 'saldo' ? saldoPendiente * (seguroDesgravamen / 100) : monto * (seguroDesgravamen / 100);
        
        totalI += interes;
        totalS += seguro;
        totalC += comisionFija;
        saldoPendiente -= amortizacion;
        if (saldoPendiente <= 0.01) break;
      }

      const totalPagado = monto + totalI + totalS + totalC;
      return {
        sistema: sys,
        intereses: totalI,
        seguros: totalS,
        comisiones: totalC,
        total: totalPagado,
        cuotaInicial: sys === 'frances' 
          ? (cuotaFrances + (tipoSeguro === 'saldo' ? monto * (seguroDesgravamen / 100) : monto * (seguroDesgravamen / 100)) + comisionFija)
          : (sys === 'aleman' 
            ? (amortAleman + (monto * i) + (tipoSeguro === 'saldo' ? monto * (seguroDesgravamen / 100) : monto * (seguroDesgravamen / 100)) + comisionFija)
            : ((monto * i) + (tipoSeguro === 'saldo' ? monto * (seguroDesgravamen / 100) : monto * (seguroDesgravamen / 100)) + comisionFija))
      };
    };

    return [
      calcularParaSistema('frances'),
      calcularParaSistema('aleman'),
      calcularParaSistema('americano')
    ];
  }, [monto, periodosTotales, tasaEfectivaMensual, seguroDesgravamen, tipoSeguro, comisionFija]);

  // --- Handlers de Pagos Extraordinarios ---
  const agregarPagoExtraordinario = (e) => {
    e.preventDefault();
    if (nuevoPagoMes < 1 || nuevoPagoMes > periodosTotales) {
      alert(`El mes de abono debe estar dentro del plazo pactado (1 a ${periodosTotales}).`);
      return;
    }
    if (nuevoPagoMonto <= 0) return;

    // Evitar duplicados reemplazando o añadiendo
    const filtrados = pagosExtraordinarios.filter(p => p.mes !== nuevoPagoMes);
    const actualizados = [...filtrados, { 
      mes: Number(nuevoPagoMes), 
      monto: Number(nuevoPagoMonto), 
      accion: nuevoPagoAccion 
    }].sort((a, b) => a.mes - b.mes);

    setPagosExtraordinarios(actualizados);
    // Auto incremental para facilitar carga consecutiva
    setNuevoPagoMes(Math.min(periodosTotales, Number(nuevoPagoMes) + 1));
  };

  const eliminarPagoExtraordinario = (mes) => {
    setPagosExtraordinarios(pagosExtraordinarios.filter(p => p.mes !== mes));
  };

  // --- Exportador CSV ---
  const exportarCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Mes,Saldo Inicial,Cuota Financiera,Interes,Amortizacion,Seguro,Comision,Pago Extraordinario,Cuota Total,Saldo Final\r\n";

    cronograma.forEach(c => {
      const row = [
        c.mes,
        c.saldoInicial.toFixed(2),
        c.cuotaFinanciera.toFixed(2),
        c.interes.toFixed(2),
        c.amortizacion.toFixed(2),
        c.seguro.toFixed(2),
        c.comision.toFixed(2),
        c.prepago.toFixed(2),
        c.cuotaTotal.toFixed(2),
        c.saldoFinal.toFixed(2)
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Amortizacion_${sistema}_${monto}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Header Corporativo */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-600/30">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                FinanMetrics Actuarial
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Simulador de Amortización Profesional
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setVerAyuda(!verAyuda)}
              className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md transition border border-slate-700"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline">Guía de Sistemas</span>
            </button>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              v2.5 Pro
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Banner de Bienvenida Actuarial */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-2">
              <CheckCircle className="h-4 w-4" />
              <span>Garantía de Validez Actuarial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Análisis Avanzado de Crédito & Estructura de Costos
            </h2>
            <p className="mt-2 text-slate-300 max-w-3xl text-sm leading-relaxed">
              Explore los diferentes sistemas de amortización financiera del mercado internacional. Proyecte flujos, incorpore primas de seguro de desgravamen y determine con precisión científica el <strong>Costo Financiero Total (CFTEA)</strong> resolviendo las ecuaciones de equivalencia financiera por métodos numéricos.
            </p>
          </div>
        </div>

        {/* Layout de 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA: CONFIGURADOR / ENTRADAS (4 Cols de 12) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tarjeta 1: Parámetros del Crédito */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Parámetros Financieros</span>
                <Info className="h-4 w-4 text-slate-500" />
              </h3>

              <div className="space-y-4">
                {/* Monto */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Monto de Capital</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      value={monto}
                      onChange={(e) => setMonto(Math.max(0, Number(e.target.value)))}
                      className="block w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                      placeholder="Ej. 100000"
                    />
                  </div>
                </div>

                {/* Plazo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Plazo</label>
                    <input
                      type="number"
                      value={plazo}
                      onChange={(e) => setPlazo(Math.max(1, Number(e.target.value)))}
                      className="block w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Medida</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setPlazoTipo('meses')}
                        className={`py-1 text-xs font-medium rounded-md transition ${plazoTipo === 'meses' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Meses
                      </button>
                      <button
                        onClick={() => setPlazoTipo('años')}
                        className={`py-1 text-xs font-medium rounded-md transition ${plazoTipo === 'años' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                      >
                        Años
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tasa de Interés */}
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-7">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tasa de Interés (%)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Percent className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={tasaValor}
                        onChange={(e) => setTasaValor(Math.max(0, Number(e.target.value)))}
                        className="block w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div className="col-span-5">
                    <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setTipoTasa('TEA')}
                        className={`py-1.5 text-xs font-medium rounded-md transition ${tipoTasa === 'TEA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Tasa Efectiva Anual"
                      >
                        TEA
                      </button>
                      <button
                        onClick={() => setTipoTasa('TNA')}
                        className={`py-1.5 text-xs font-medium rounded-md transition ${tipoTasa === 'TNA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        title="Tasa Nominal Anual con cap. mensual"
                      >
                        TNA
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conversión de tasas informativa */}
                <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Tasa de Interés Nominal:</span>
                    <span className="font-mono text-slate-300">
                      {tipoTasa === 'TNA' ? `${tasaValor.toFixed(2)}%` : `${((Math.pow(1 + tasaValor/100, 1/12) - 1) * 12 * 100).toFixed(2)}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tasa de Interés Efectiva Mensual (TEM):</span>
                    <span className="font-mono text-indigo-400 font-semibold">
                      {(tasaEfectivaMensual * 100).toFixed(4)}%
                    </span>
                  </div>
                </div>

                {/* Sistema de Amortización */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Sistema de Amortización</label>
                  <div className="space-y-2">
                    <label className={`flex items-start p-2.5 rounded-lg border transition cursor-pointer ${sistema === 'frances' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="sistema"
                        checked={sistema === 'frances'}
                        onChange={() => setSistema('frances')}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-800"
                      />
                      <div className="ml-3">
                        <span className="block text-xs font-bold text-slate-200">Francés (Amortización Progresiva)</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Cuotas de capital + interés constantes. Menor presión de caja inicial.</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-2.5 rounded-lg border transition cursor-pointer ${sistema === 'aleman' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="sistema"
                        checked={sistema === 'aleman'}
                        onChange={() => setSistema('aleman')}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-800"
                      />
                      <div className="ml-3">
                        <span className="block text-xs font-bold text-slate-200">Alemán (Amortización Constante)</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Cuotas decrecientes. Mayor amortización de capital al inicio, ahorra intereses.</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-2.5 rounded-lg border transition cursor-pointer ${sistema === 'americano' ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                      <input
                        type="radio"
                        name="sistema"
                        checked={sistema === 'americano'}
                        onChange={() => setSistema('americano')}
                        className="mt-1 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-800"
                      />
                      <div className="ml-3">
                        <span className="block text-xs font-bold text-slate-200">Americano (Al Vencimiento)</span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">Solo paga interés periódico. Devuelve todo el capital en la última cuota.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Tarjeta 2: Costos Adicionales / Primas Actuariales */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Cargos Adicionales</span>
                <Layers className="h-4 w-4 text-slate-500" />
              </h3>

              <div className="space-y-4">
                {/* Seguro de Desgravamen */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-400 uppercase">Seguro de Desgravamen</label>
                    <div className="flex space-x-1 bg-slate-900 p-0.5 rounded border border-slate-800">
                      <button
                        onClick={() => setTipoSeguro('saldo')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition ${tipoSeguro === 'saldo' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        S/ Saldo
                      </button>
                      <button
                        onClick={() => setTipoSeguro('fijo')}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition ${tipoSeguro === 'fijo' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      >
                        S/ Monto
                      </button>
                    </div>
                  </div>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      step="0.001"
                      value={seguroDesgravamen}
                      onChange={(e) => setSeguroDesgravamen(Math.max(0, Number(e.target.value)))}
                      className="block w-full pl-8 pr-16 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">mensual</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {tipoSeguro === 'saldo' 
                      ? "Calculado sobre el saldo pendiente de cada período (Recomendado actuarial)." 
                      : "Calculado de forma constante sobre el monto original desembolsado."}
                  </p>
                </div>

                {/* Comisión Fija */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Gasto Administrativo Fijo ($)</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <input
                      type="number"
                      value={comisionFija}
                      onChange={(e) => setComisionFija(Math.max(0, Number(e.target.value)))}
                      className="block w-full pl-8 pr-16 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">por cuota</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Pagos Extraordinarios Simulación */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-md">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Abonos Extraordinarios</span>
                <Calendar className="h-4 w-4 text-slate-500" />
              </h3>

              <form onSubmit={agregarPagoExtraordinario} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mes de Abono</label>
                    <input
                      type="number"
                      min="1"
                      max={periodosTotales}
                      value={nuevoPagoMes}
                      onChange={(e) => setNuevoPagoMes(Math.max(1, Number(e.target.value)))}
                      className="block w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monto de Prepago</label>
                    <input
                      type="number"
                      value={nuevoPagoMonto}
                      onChange={(e) => setNuevoPagoMonto(Math.max(0, Number(e.target.value)))}
                      className="block w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Efecto del Abono</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNuevoPagoAccion('plazo')}
                      className={`py-1 text-[10px] font-medium rounded transition ${nuevoPagoAccion === 'plazo' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      title="Mantiene la cuota ordinaria aproximada acortando el plazo de vida del crédito"
                    >
                      Reducir Plazo
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoPagoAccion('cuota')}
                      className={`py-1 text-[10px] font-medium rounded transition ${nuevoPagoAccion === 'cuota' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                      title="Mantiene la fecha de vencimiento final reduciendo el valor de las siguientes cuotas"
                    >
                      Reducir Cuota
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition text-xs shadow-md shadow-indigo-600/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Programar Prepago</span>
                </button>
              </form>

              {/* Listado de Pagos Registrados */}
              {pagosExtraordinarios.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 max-h-40 overflow-y-auto">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Abonos Planificados:</span>
                  {pagosExtraordinarios.map((p, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
                      <div className="font-mono">
                        <span className="text-indigo-400 font-bold">Mes {p.mes}:</span> ${p.monto.toLocaleString(undefined, {minimumFractionDigits:2})}
                        <span className="block text-[9px] text-slate-500">
                          Efecto: {p.accion === 'plazo' ? 'Acortar Plazo' : 'Disminuir Cuotas'}
                        </span>
                      </div>
                      <button
                        onClick={() => eliminarPagoExtraordinario(p.mes)}
                        className="p-1 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-md transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA: DASHBOARD DE RESULTADOS (8 Cols de 12) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* KPI Dashboard (Cuadros de Resumen de Impacto Actuarial) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Costo Financiero Total */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mt-8 -mr-8 transition group-hover:bg-indigo-500/10"></div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Costo Financiero Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
                  {cftAnual.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">CFTEA (Tasa Real de Costo)</span>
              </div>

              {/* Total Intereses */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Intereses Puro</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
                  ${resumen.totalInteres.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Rendimiento para el acreedor</span>
              </div>

              {/* Cargos de Terceros/Seguro */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cargos Adicionales</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
                  ${(resumen.totalSeguro + resumen.totalComisiones).toLocaleString(undefined, {maximumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Seguro de Vida & Gastos Adm.</span>
              </div>

              {/* Total Desembolso Total */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pago Neto Total</span>
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono block mt-1">
                  ${resumen.totalPagado.toLocaleString(undefined, {maximumFractionDigits: 2})}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {resumen.duracionReal < periodosTotales 
                    ? `Liquidado en ${resumen.duracionReal} meses (Acelerado)` 
                    : `Plazo de ${resumen.duracionReal} periodos`}
                </span>
              </div>
            </div>

            {/* PESTAÑAS DEL DASHBOARD */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
              <div className="flex border-b border-slate-800 bg-slate-950/80 p-2">
                <button
                  onClick={() => setPestanaActiva('tabla')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition ${pestanaActiva === 'tabla' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Cronograma Detallado</span>
                </button>
                <button
                  onClick={() => setPestanaActiva('analisis')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition ${pestanaActiva === 'analisis' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Métricas & Eficiencia</span>
                </button>
                <button
                  onClick={() => setPestanaActiva('comparativo')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition ${pestanaActiva === 'comparativo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Comparador Actuarial</span>
                </button>
              </div>

              {/* CONTENIDO PESTAÑA 1: CRONOGRAMA */}
              {pestanaActiva === 'tabla' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Tabla de Proyección de Amortización</h4>
                      <p className="text-[11px] text-slate-500">Esquema proyectado para cada fecha de pago considerando seguros y comisiones.</p>
                    </div>
                    <button
                      onClick={exportarCSV}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs transition border border-slate-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>

                  {/* Tabla Responsiva */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-[500px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider sticky top-0 backdrop-blur z-10">
                          <th className="py-3 px-4">N°</th>
                          <th className="py-3 px-4">Saldo Inicial</th>
                          <th className="py-3 px-4">Amortización</th>
                          <th className="py-3 px-4">Intereses</th>
                          <th className="py-3 px-4">Cargos Extra</th>
                          <th className="py-3 px-4">Pago Voluntario</th>
                          <th className="py-3 px-4 text-indigo-400">Cuota Total</th>
                          <th className="py-3 px-4">Saldo Restante</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {cronograma.map((c) => (
                          <tr key={c.mes} className={`hover:bg-slate-900/40 transition ${c.prepago > 0 ? 'bg-indigo-950/20' : ''}`}>
                            <td className="py-2.5 px-4 font-bold text-slate-300">{c.mes}</td>
                            <td className="py-2.5 px-4">${c.saldoInicial.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-2.5 px-4">${c.amortizacion.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-2.5 px-4">${c.interes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-2.5 px-4" title={`Seguro: $${c.seguro.toFixed(2)} | Adm: $${c.comision.toFixed(2)}`}>
                              ${(c.seguro + c.comision).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="py-2.5 px-4 text-amber-400 font-semibold">
                              {c.prepago > 0 ? `$${c.prepago.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                            </td>
                            <td className="py-2.5 px-4 text-indigo-300 font-bold">${c.cuotaTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td className="py-2.5 px-4 font-bold text-slate-300">${c.saldoFinal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Notas aclaratorias */}
                  <div className="mt-4 flex items-start space-x-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
                    <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Nota de Auditoría Actuarial:</strong> Todos los cálculos utilizan bases de devengo mensuales y capitalización periódica discreta estándar. Si aplica abonos extraordinarios, la estructura recalcula automáticamente los flujos para optimizar su tasa real de costo.
                    </div>
                  </div>
                </div>
              )}

              {/* CONTENIDO PESTAÑA 2: MÉTRICAS Y EFICIENCIA */}
              {pestanaActiva === 'analisis' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Gráfico de Composición del Pago Acumulado</h4>
                    <p className="text-[11px] text-slate-500">Estructura del destino de cada dólar pagado por el cliente durante la vida del crédito.</p>
                  </div>

                  {/* Barra de Distribución Porcentual */}
                  <div className="space-y-4">
                    <div className="h-6 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                      {/* Capital */}
                      <div 
                        style={{ width: `${(monto / resumen.totalPagado) * 100}%` }}
                        className="bg-indigo-600 hover:bg-indigo-500 transition-all duration-500"
                        title="Devolución de Capital"
                      ></div>
                      {/* Intereses */}
                      <div 
                        style={{ width: `${(resumen.totalInteres / resumen.totalPagado) * 100}%` }}
                        className="bg-amber-500 hover:bg-amber-400 transition-all duration-500"
                        title="Intereses Devengados"
                      ></div>
                      {/* Primas Seguro */}
                      <div 
                        style={{ width: `${(resumen.totalSeguro / resumen.totalPagado) * 100}%` }}
                        className="bg-teal-500 hover:bg-teal-400 transition-all duration-500"
                        title="Seguro de Desgravamen"
                      ></div>
                      {/* Gastos Adm */}
                      <div 
                        style={{ width: `${(resumen.totalComisiones / resumen.totalPagado) * 100}%` }}
                        className="bg-rose-500 hover:bg-rose-400 transition-all duration-500"
                        title="Comisiones Fijas"
                      ></div>
                    </div>

                    {/* Leyenda Detallada */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="flex items-center space-x-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Capital Amortizado</span>
                          <span className="font-bold text-white">${monto.toLocaleString(undefined, {maximumFractionDigits:2})} ({(monto/resumen.totalPagado*100).toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="w-3 h-3 bg-amber-500 rounded"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Intereses Totales</span>
                          <span className="font-bold text-white">${resumen.totalInteres.toLocaleString(undefined, {maximumFractionDigits:2})} ({(resumen.totalInteres/resumen.totalPagado*100).toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="w-3 h-3 bg-teal-500 rounded"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Primas Seguro</span>
                          <span className="font-bold text-white">${resumen.totalSeguro.toLocaleString(undefined, {maximumFractionDigits:2})} ({(resumen.totalSeguro/resumen.totalPagado*100).toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="w-3 h-3 bg-rose-500 rounded"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400">Comisiones Fijas</span>
                          <span className="font-bold text-white">${resumen.totalComisiones.toLocaleString(undefined, {maximumFractionDigits:2})} ({(resumen.totalComisiones/resumen.totalPagado*100).toFixed(1)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Diagnóstico Actuarial */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <span>Indicadores de Eficiencia Financiera</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Eficiencia del pago */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Ratio de Amortización Real (RAR)</span>
                          <span className="font-bold text-indigo-400">{resumen.ratioEficiencia.toFixed(2)}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div style={{ width: `${resumen.ratioEficiencia}%` }} className="bg-indigo-500 h-full"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Representa qué porción de sus desembolsos ordinarios va directamente a extinguir la deuda principal en lugar de pagar intereses y comisiones. A mayor porcentaje, mayor velocidad de desendeudamiento.
                        </span>
                      </div>

                      {/* Costo Extra sobre Tasa */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Margen de Recargo Externo</span>
                          <span className="font-bold text-amber-500">
                            {(cftAnual - (tipoTasa === 'TEA' ? tasaValor : (Math.pow(1 + (tasaValor/100)/12, 12)-1)*100)).toFixed(2)}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, Math.max(0, (cftAnual - tasaValor) * 5))}%` }} 
                            className="bg-amber-500 h-full"
                          ></div>
                        </div>
                        <span className="text-[10px] text-slate-500 block leading-tight">
                          Es la brecha entre la Tasa de Interés pura pactada y el Costo Financiero Total real generado por seguros y cargos administrativos fijos obligatorios.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico de Evolución del Saldo Pendiente */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">Evolución de Cuotas e Intereses en el Tiempo</h5>
                    <div className="h-44 w-full flex items-end space-x-1.5 pt-4">
                      {cronograma.map((c, idx) => {
                        // Limitar render a máximo 36 columnas para visualización amigable
                        if (cronograma.length > 36 && idx % Math.ceil(cronograma.length / 36) !== 0) return null;
                        const maxCuota = Math.max(...cronograma.map(x => x.cuotaTotal));
                        const amortPct = (c.amortizacion / maxCuota) * 100;
                        const intPct = (c.interes / maxCuota) * 100;
                        const cargosPct = ((c.seguro + c.comision) / maxCuota) * 100;

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center h-full group relative">
                            {/* Barra Apilada */}
                            <div className="w-full flex flex-col justify-end h-full rounded bg-slate-800/40 overflow-hidden">
                              <div style={{ height: `${cargosPct}%` }} className="bg-teal-500/80" />
                              <div style={{ height: `${intPct}%` }} className="bg-amber-500/80" />
                              <div style={{ height: `${amortPct}%` }} className="bg-indigo-600/80" />
                            </div>
                            
                            {/* Etiqueta Eje X */}
                            <span className="text-[8px] text-slate-500 mt-1 font-mono">{c.mes}</span>

                            {/* Tooltip Hover */}
                            <div className="absolute bottom-full mb-2 hidden group-hover:block z-25 bg-slate-950 border border-slate-700 p-2 rounded shadow-xl text-[10px] w-36 pointer-events-none">
                              <span className="block font-bold text-slate-300">Mes {c.mes}</span>
                              <span className="block text-indigo-400">Amort: ${c.amortizacion.toFixed(0)}</span>
                              <span className="block text-amber-400">Interés: ${c.interes.toFixed(0)}</span>
                              <span className="block text-teal-400">Cargos: ${(c.seguro + c.comision).toFixed(0)}</span>
                              <span className="block text-white font-bold border-t border-slate-800 mt-1 pt-0.5">Total: ${c.cuotaTotal.toFixed(0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center space-x-4 mt-3 text-[10px] text-slate-400 font-semibold uppercase">
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-indigo-600 rounded"></div>
                        <span>Amortización</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded"></div>
                        <span>Intereses</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2.5 h-2.5 bg-teal-500 rounded"></div>
                        <span>Cargos Extra</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* CONTENIDO PESTAÑA 3: COMPARADOR ACTUARIAL */}
              {pestanaActiva === 'comparativo' && (
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Comparación de Estructuras (Mismo Plazo y Tasa)</h4>
                    <p className="text-[11px] text-slate-500">Analice las tres filosofías de amortización bajo el lente de flujos financieros absolutos.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {comparativaSistemas.map((comp) => {
                      const esSeleccionado = comp.sistema === sistema;
                      return (
                        <div 
                          key={comp.sistema}
                          className={`rounded-2xl p-5 border transition-all ${
                            esSeleccionado 
                              ? 'bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-500/5' 
                              : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Sistema {comp.sistema === 'frances' ? 'Francés' : (comp.sistema === 'aleman' ? 'Alemán' : 'Americano')}
                            </span>
                            {esSeleccionado && (
                              <span className="text-[9px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-bold uppercase">
                                Activo
                              </span>
                            )}
                          </div>

                          <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                              <span className="text-slate-400 text-[10px]">Primera Cuota Total:</span>
                              <span className="font-bold text-slate-200">${comp.cuotaInicial.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                              <span className="text-slate-400 text-[10px]">Intereses Totales:</span>
                              <span className="font-bold text-slate-200">${comp.intereses.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                              <span className="text-slate-400 text-[10px]">Cargos de Seguro:</span>
                              <span className="font-bold text-slate-200">${comp.seguros.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                            </div>
                            <div className="flex justify-between pt-1 font-sans">
                              <span className="text-slate-300 font-bold">Desembolso Total:</span>
                              <span className="text-sm font-black text-indigo-400">${comp.total.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                            </div>
                          </div>

                          {/* Botón rápido para cambiar de sistema */}
                          {!esSeleccionado && (
                            <button
                              onClick={() => setSistema(comp.sistema)}
                              className="mt-4 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                            >
                              <span>Aplicar Sistema</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Cuadro de Conclusión Actuarial */}
                  <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-5">
                    <h5 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Recomendación e Insight del Experto</h5>
                    <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                      <p>
                        • El <strong>Sistema Alemán</strong> es matemáticamente el más eficiente en acumulación neta de intereses ya que reduce el saldo capital de forma veloz desde la primera fecha. Sin embargo, su cuota inicial elevada requiere una mayor capacidad de flujo de efectivo en los primeros meses.
                      </p>
                      <p>
                        • El <strong>Sistema Francés</strong> ofrece un excelente balance para las economías familiares ya que la cuota es constante (excepto por la reducción del seguro si es sobre saldo), facilitando la planificación del presupuesto mensual.
                      </p>
                      <p>
                        • El <strong>Sistema Americano</strong> es ideal para empresas o proyectos de inversión que generarán un retorno importante al final de un ciclo productivo, requiriendo un costo operativo periódico mínimo pero un riesgo de liquidez final alto.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* MODAL INFORMATIVO / GUIA ACTUARIAL */}
      {verAyuda && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <h4 className="text-base font-extrabold text-white flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-indigo-400" />
                <span>Ecuaciones e Ingeniería Financiera</span>
              </h4>
              <button
                onClick={() => setVerAyuda(false)}
                className="text-slate-400 hover:text-white font-bold text-xs bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <section className="space-y-1">
                <h5 className="font-bold text-indigo-400 uppercase">1. Equivalencia de Tasas (Discreta Mensual)</h5>
                <p>
                  Para convertir la Tasa Efectiva Anual (TEA) a Tasa Efectiva Mensual (TEM), la teoría del interés compuesto dicta:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200">
                  TEM = (1 + TEA) ^ (1/12) - 1
                </div>
                <p>
                  Para la Tasa Nominal Anual (TNA) con capitalización mensual periódica ordinaria:
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200">
                  TEM = TNA / 12
                </div>
              </section>

              <section className="space-y-1">
                <h5 className="font-bold text-indigo-400 uppercase">2. Métodos de Cálculo del Servicio de Deuda</h5>
                <ul className="list-disc pl-4 space-y-2">
                  <li>
                    <strong>Método Francés:</strong> Se basa en una anualidad ordinaria constante.
                    <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200 mt-1">
                      Cuota = Capital * [ i / (1 - (1+i)^-n) ]
                    </div>
                  </li>
                  <li>
                    <strong>Método Alemán:</strong> Amortización constante de capital en cada período. El interés decae linealmente.
                    <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200 mt-1">
                      Amortización = Capital / n <br />
                      Cuota(t) = Amortización + (Saldo_Inicial(t) * i)
                    </div>
                  </li>
                  <li>
                    <strong>Método Americano:</strong> Servicio exclusivo de interés hasta el vencimiento final, donde se liquida el capital principal acumulado.
                    <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200 mt-1">
                      Interés(t) = Capital * i <br />
                      Amortización(t) = 0 (para t &lt; n), Amortización(n) = Capital
                    </div>
                  </li>
                </ul>
              </section>

              <section className="space-y-1">
                <h5 className="font-bold text-indigo-400 uppercase">3. Costo Financiero Total (CFT / CFTEA)</h5>
                <p>
                  Calculado mediante métodos de optimización numérica (Método de la Secante) resolviendo el VAN (Valor Actual Neto) para el flujo real de fondos que enfrenta el cliente (Monto vs. Cuota Final con Seguros):
                </p>
                <div className="bg-slate-900 p-2 rounded font-mono text-center text-slate-200">
                  0 = -Monto + ∑ [ CuotaTotal(t) / (1 + TIR_Mensual)^t ]
                </div>
                <p className="mt-1">
                  Posteriormente se anualiza de forma efectiva: <strong>CFTEA = (1 + TIR_Mensual)^12 - 1</strong>. Este número representa el verdadero costo financiero anual de la transacción financiera.
                </p>
              </section>
            </div>
            
            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                onClick={() => setVerAyuda(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition"
              >
                Comprendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800 pt-6 text-center text-[10px] text-slate-500">
        <p>FinanMetrics Actuarial Inc. © 2026. Todos los derechos reservados.</p>
        <p className="mt-1">Este simulador es un modelo de cálculo analítico y matemático. Las entidades comerciales y bancarias pueden aplicar redondeos discretos o variaciones en las bases de días (360/365).</p>
      </footer>

    </div>
  );
}