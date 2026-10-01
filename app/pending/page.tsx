import Link from "next/link";

export const metadata = {
  title: "Pago en revisión",
  robots: { index: false },
};

export default function PendingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#111] border border-yellow-500/30 rounded-2xl p-10 text-center">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-3xl font-bold text-white mb-4">Tu pago está en revisión</h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          Algunas formas de pago tardan un poco más en acreditarse. apenas Mercado Pago confirme el pago te enviamos el
          ebook al correo con el que compraste. No tenés que pagar nada de nuevo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-xl font-extrabold transition-all hover:scale-105"
          >
            VOLVER AL INICIO
          </Link>
          <a
            href="mailto:niikoob96@gmail.com"
            className="border border-white/15 hover:border-white/40 text-zinc-200 px-8 py-4 rounded-xl font-semibold transition-all"
          >
            ESCRIBINOS
          </a>
        </div>
      </div>
    </main>
  );
}