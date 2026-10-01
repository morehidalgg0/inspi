"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3 * 3600 + 45 * 60 + 12); // 3h 45m 12s evergreen timer
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setCheckoutLoading(true);

    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError(data.error ?? 'No pudimos iniciar el pago. Intentá de nuevo.');
    } catch {
      setCheckoutError('Falló la conexión. Revisá tu internet e intentá de nuevo.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-zinc-100 min-h-screen relative selection:bg-blue-500/30 font-sans overflow-x-hidden">
      
      {/* ANNOUNCEMENT BANNER */}
      <div className="fixed top-0 left-0 w-full h-10 bg-gradient-to-r from-red-700 to-red-500 flex items-center justify-center z-[60] text-white text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)]">
        <span className="flex items-center gap-2">
          ¡ÚLTIMAS HORAS DISPONIBLE! - OFERTA <i className="fa-regular fa-clock ml-2"></i> {mounted ? formatTime(timeLeft) : "03:45:12"}
        </span>
      </div>

      {/* Background Effects */}
      <div className="absolute w-[800px] h-[600px] top-[-200px] left-1/2 -translate-x-1/2 z-0 blur-[80px]"
           style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(0,0,0,0) 60%)' }}>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-10 w-full z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs">
              <i className="fa-solid fa-bolt"></i>
            </div>
            De la Idea a los Ingresos
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400 font-medium">
            <Link href="#modulos" className="hover:text-white transition">Temario</Link>
            <Link href="#bonos" className="hover:text-white transition">Bonos Gratis</Link>
            <Link href="#faq" className="hover:text-white transition">FAQ</Link>
          </div>
          <Link href="#pricing" className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-zinc-200 transition shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Comprar Ahora
          </Link>
        </div>
      </nav>

      <main className="pt-32 lg:pt-40 pb-20 px-6 max-w-5xl mx-auto z-10 relative">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-semibold text-blue-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            DE LA IDEA A LOS INGRESOS
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]"
              style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Convertí una idea en tu propio <br className="hidden md:block" /> 
            <span style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              producto digital 
            </span> y aprendé a venderlo
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Un sistema paso a paso para crear tu primer producto digital, publicarlo y <strong className="text-white font-medium">comenzar a generar ingresos</strong> con él.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-3xl text-sm font-medium text-zinc-300">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i> No necesitás ser experto en tecnología.
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i> No necesitás tener una gran audiencia.
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center gap-2">
              <i className="fa-solid fa-check text-green-500"></i> No necesitás un negocio enorme.
            </div>
          </div>

          <p className="text-xl font-medium text-white mb-8">Solo necesitás una idea y saber cómo transformarla en algo que otras personas quieran comprar <span className="text-blue-400 underline decoration-wavy underline-offset-4">Y OBTENER ESTOS RESULTADOS.</span></p>
          
          {/* Main Book Mockup */}
          <div className="relative mb-12 group w-full max-w-4xl mx-auto flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-[80px] rounded-full"></div>
            <img src="/hero_bundle.webp" alt="Pack Completo Ebook + Bonos" className="relative z-10 w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-700 hover:scale-105" />
          </div>

          <Link href="#pricing" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 hover:scale-105 transition-all px-10 py-5 rounded-full font-bold tracking-wide text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)] w-full sm:w-auto">
            QUIERO CREAR MI PRODUCTO DIGITAL
          </Link>
        </section>

        {/* PAIN POINTS */}
        <section className="py-20 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-white">
              ¿Y SI ESO QUE SABÉS PUDIERA CONVERTIRSE EN INGRESOS?
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Quizás tenés conocimientos, experiencia, una habilidad o simplemente una idea que hace tiempo querés desarrollar. Pero no sabés:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 bg-[#111] p-8 rounded-2xl border border-white/10">
              {['Por dónde empezar.', 'Qué producto crear.', 'Cómo estructurarlo.', 'Cómo diseñarlo.', 'Cómo venderlo.', 'Cómo conseguir compradores.', 'Cómo automatizar el proceso.'].map((punto, i) => (
                <div key={i} className="flex items-center gap-4 text-zinc-300 font-medium text-lg">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-xmark text-red-500"></i>
                  </div>
                  {punto}
                </div>
              ))}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold text-white mb-6 leading-tight">
                <span className="text-blue-400">De la Idea a los Ingresos</span> fue creado para mostrarte el proceso completo, paso a paso.
              </h3>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Desde encontrar una idea hasta crear, publicar y comenzar a vender tu propio producto digital.
              </p>
            </div>
          </div>
        </section>

        {/* MODULES */}
        <section id="modulos" className="py-20 border-t border-white/5">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16 text-white">
            ¿QUÉ VAS A APRENDER?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: '01', title: 'ENCONTRÁ UNA IDEA QUE PUEDA VENDERSE', text: 'Aprendé a identificar conocimientos, experiencias y problemas que pueden transformarse en un producto digital. Vas a conocer un método práctico para validar si existe interés.' },
              { num: '02', title: 'CREÁ TU PRODUCTO CON INTELIGENCIA ARTIFICIAL', text: 'Descubrí cómo utilizar herramientas como ChatGPT para acelerar la creación de tu ebook. Aprendé a estructurar capítulos y transformar tus conocimientos.' },
              { num: '03', title: 'CONVERTÍ TU IDEA EN UN PRODUCTO PROFESIONAL', text: 'No alcanza con tener información. Aprendé a organizarla y diseñarla. Conocerás herramientas como Canva para darle una presentación profesional.' },
              { num: '04', title: 'CREÁ TU SISTEMA DE VENTA ONLINE', text: 'Aprendé cómo llevar tu producto a Internet y crear un sistema que permita que las personas puedan conocerlo, comprarlo y recibirlo digitalmente.' },
              { num: '05', title: 'APRENDÉ A VENDER CON INSTAGRAM', text: 'Descubrí cómo utilizar Instagram para presentar tu producto. Ideas para: Stories, Carruseles, Llamadas a la acción y Contenido de venta.' },
              { num: '06', title: 'DESCUBRÍ CÓMO UTILIZAR META ADS', text: 'Cuando quieras ir más allá del alcance orgánico, vas a conocer los fundamentos para publicidad en Facebook e Instagram: Públicos, Retargeting y Optimización.' },
              { num: '07', title: 'AUTOMATIZÁ PARTE DEL PROCESO', text: 'La idea no es estar respondiendo mensajes manualmente. Descubrí herramientas que automatizan tu sistema de ventas.' },
              { num: '08', title: 'APRENDÉ A ESCALAR', text: 'El objetivo no termina ahí. Descubrí cómo utilizar tu primer producto como punto de partida para desarrollar nuevas ofertas y packs.' },
            ].map((mod, i) => (
              <div key={i} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-colors group">
                <div className="text-blue-500 font-black text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{mod.num}</div>
                <h4 className="text-xl font-bold text-white mb-3 tracking-wide">{mod.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{mod.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BONUSES */}
        <section id="bonos" className="py-20 border-t border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">PERO ÉSTO NO ES TODO…</h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Al adquirir «De la Idea a los Ingresos», recibes <strong className="text-purple-400">4 bonos extra de regalo</strong>.
            </p>
            <div className="mt-6 inline-block bg-purple-500/20 border border-purple-500/30 text-purple-300 px-6 py-2 rounded-full font-semibold">
              Valor real: más de $70 USD – Hoy: GRATIS por tiempo limitado.
            </div>
            <p className="mt-4 text-sm text-zinc-400">Solo disponible para quienes COMPREN HOY.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* Bono 1 with image */}
            <div className="bg-[#111] p-8 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row gap-6 md:col-span-2 items-center">
              <div className="flex-1">
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">BONO #1</div>
                <h4 className="text-2xl font-bold text-white mb-2">Páginas de venta editables.</h4>
                <p className="text-zinc-400 text-sm">Diseños probados y listos para usar, para que publiques tu ebook de manera profesional y comiences a vender más rápido.</p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/bono1.jpg" alt="Páginas editables" className="w-full max-w-[200px] rounded-lg" />
                </div>
              </div>
            </div>

            {/* Bono 2 with image (Mirrored) */}
            <div className="bg-[#111] p-8 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row-reverse gap-6 md:col-span-2 items-center">
              <div className="flex-1">
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">BONO #2</div>
                <h4 className="text-2xl font-bold text-white mb-2">100 Prompts de ChatGPT.</h4>
                <p className="text-zinc-400 text-sm">Accede a una lista premium de comandos listos para crear, automatizar y vender ebooks en minutos con inteligencia artificial.</p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/bono2.jpg" alt="100 Prompts ChatGPT" className="w-full max-w-[200px] rounded-lg" />
                </div>
              </div>
            </div>
            
            {/* Bono 3 with image (Right) */}
            <div className="bg-[#111] p-8 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row gap-6 md:col-span-2 items-center">
              <div className="flex-1">
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">BONO #3</div>
                <h4 className="text-2xl font-bold text-white mb-2">Mapa de Propósito.</h4>
                <p className="text-zinc-400 text-sm">Un workbook práctico para descubrir tu verdadero “por qué”, alinear tu talento con tu negocio digital y tener claridad sobre el camino que quieres construir.</p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/bono3.webp" alt="Mapa de Propósito" className="w-full max-w-[200px] rounded-lg" />
                </div>
              </div>
            </div>

            {/* Bono 4 with image (Left/Mirrored) */}
            <div className="bg-[#111] p-8 rounded-2xl border border-purple-500/20 flex flex-col md:flex-row-reverse gap-6 md:col-span-2 items-center">
              <div className="flex-1">
                <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-block">BONO #4</div>
                <h4 className="text-2xl font-bold text-white mb-2">Comunidad Privada.</h4>
                <p className="text-zinc-400 text-sm">Un espacio exclusivo donde conectas con personas como tu, compartes avances y resuelves dudas a la vez que encuentras motivación constante.</p>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img src="/bono4.webp" alt="Comunidad Privada" className="w-full max-w-[200px] rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING TIER (The aggressive marketing hook) */}
        <section id="pricing" className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10">
            
            {/* Summary */}
            <div className="flex-1 bg-[#111] p-8 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">🎯 ¿Por qué deberías llevarte «De la idea a los ingresos»?</h3>
              <p className="text-zinc-400 mb-6">Esto es lo que te llevas por solo $27 USD</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                  <span className="text-zinc-300 font-medium">EBOOK: «De la Idea a los Ingresos»</span>
                  <span className="text-zinc-500 line-through">$30.000</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                  <span className="text-zinc-300 font-medium">BONO 1: Páginas de venta editables</span>
                  <span className="text-zinc-500 line-through">$18.000</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                  <span className="text-zinc-300 font-medium">BONO 2: 100 prompts de chatgpt</span>
                  <span className="text-zinc-500 line-through">$15.000</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                  <span className="text-zinc-300 font-medium">BONO 3: Mapa de propósito</span>
                  <span className="text-zinc-500 line-through">$12.000</span>
                </li>
                <li className="flex justify-between items-center border-b border-white/5 pb-2 text-sm">
                  <span className="text-zinc-300 font-medium">BONO 4: Comunidad privada</span>
                  <span className="text-zinc-500 line-through">$10.000</span>
                </li>
              </ul>
              
              <div className="flex justify-between items-end">
                <div className="text-zinc-400 font-medium">Valor total: <span className="line-through text-lg">$85.000 ARS</span></div>
                <div className="text-green-400 font-bold text-xl">– Hoy solo: $19.900 ARS</div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="flex-1 bg-gradient-to-b from-blue-900/40 to-[#0a0a0a] p-1 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-center py-2 text-xs font-bold uppercase tracking-wider animate-pulse">
                ¡Últimas horas disponible! - Oferta (solo 5 cupos)
              </div>
              
              <div className="bg-[#0a0a0a] h-full rounded-xl p-8 pt-12 flex flex-col items-center text-center border border-blue-500/30">
                <div className="text-yellow-400 text-xl tracking-widest mb-2">★★★★★</div>
                <p className="text-xs text-zinc-400 mb-6 font-medium">de 1325 Reseñas</p>
                
                <h3 className="text-xl font-bold text-white mb-2">SúperOferta – 75% OFF</h3>
                <p className="text-blue-400 font-medium mb-6">De la Idea a los Ingresos + Bonos</p>
                
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-zinc-500 line-through text-lg">Precio habitual: $85.000 ARS</span>
                </div>
                
                <div className="mb-8 flex items-start gap-1">
                  <span className="text-3xl font-bold text-white mt-1">$</span>
                  <span className="text-7xl font-black text-white tracking-tighter">19.900</span>
                  <span className="text-xl font-bold text-white mt-6">ARS</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="bg-green-500 hover:bg-green-400 disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none disabled:hover:scale-100 text-black w-full py-5 rounded-xl font-extrabold text-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:scale-105 transition-all mb-4">
                  {checkoutLoading ? 'REDIRIGIENDO…' : 'COMPRAR AHORA'}
                </button>

                {checkoutError && (
                  <p role="alert" className="mb-4 text-sm text-red-400 font-medium">{checkoutError}</p>
                )}

                <div className="flex flex-col gap-2 text-xs text-zinc-400 font-medium w-full">
                  <div className="flex items-center justify-center gap-2"><i className="fa-regular fa-calendar-check text-blue-400"></i> ENVÍO INMEDIATO POR EMAIL</div>
                  <div className="flex items-center justify-center gap-2"><i className="fa-solid fa-lock text-green-400"></i> PAGO SEGURO</div>
                  <div className="flex items-center justify-center gap-2"><i className="fa-solid fa-medal text-yellow-400"></i> Tienda Líder Platinum</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 border-t border-white/5">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Preguntas Frecuentes</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { q: '¿Necesito tener un ebook ya creado para aprovechar esta guía?', a: 'No. Te enseño desde cero cómo planificar, escribir, diseñar y publicar tu ebook, aunque no tengas ninguna experiencia previa.' },
              { q: '¿Qué herramientas necesito para crear mi ebook?', a: 'Solo necesitás una computadora o celular con acceso a internet. En la guía te muestro herramientas gratuitas y fáciles de usar, como Canva o Google Docs.' },
              { q: '¿Cómo se entrega el ebook al cliente después de la compra?', a: 'Te enseño a automatizar la entrega del archivo digital para que el cliente lo reciba al instante después del pago, sin que tengas que intervenir manualmente.' },
              { q: '¿Necesito experiencia previa en ventas?', a: '¡No! Este ebook está diseñado para principiantes. Te lleva paso a paso desde lo más básico hasta estrategias listas para aplicar hoy mismo.' },
              { q: '¿Cuánto tiempo tengo acceso al ebook y los bonos?', a: '¡Acceso de por vida! Podrás leerlo desde cualquier dispositivo, cuando quieras.' }
            ].map((faq, i) => (
              <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/5 py-12 text-center text-zinc-500 text-sm">
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="font-bold text-white">⚖️ Términos de Uso</p>
            <p>De la idea a los ingresos es un ebook digital de uso personal e intransferible. No se permiten reembolsos una vez entregado el ebook. Está prohibida la copia, distribución o reventa del material.</p>
            <p>📩 Para cualquier consulta o soporte: niikoob96@gmail.com</p>
            <p className="pt-8 opacity-50">&copy; 2026 De la Idea a los Ingresos. Todos los derechos reservados.</p>
          </div>
        </footer>

      </main>
    </div>
  );
}
