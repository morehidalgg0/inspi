import Link from "next/link";

export const metadata = {
  title: "¡Gracias por tu compra!",
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const paymentId = typeof params.payment_id === "string" ? params.payment_id : null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-[#111] border border-green-500/30 rounded-2xl p-10 text-center shadow-[0_0_60px_rgba(34,197,94,0.12)]">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-white mb-4">¡Pago aprobado!</h1>
        <p className="text-zinc-400 leading-relaxed mb-8">
          Ya tenés acceso a <span className="text-white font-semibold">De la Idea a los Ingresos + 4 Bonos</span>. Te
          enviamos el ebook y los bonuses al correo con el que compraste. Si no lo ves en los próximos minutos, revisá
          la carpeta de spam.
        </p>

        {paymentId && (
          <p className="text-xs text-zinc-600 mb-8">
            Número de operación: <span className="font-mono text-zinc-400">{paymentId}</span>
          </p>
        )}

        <Link
          href="/"
          className="inline-block bg-green-500 hover:bg-green-400 text-black px-8 py-4 rounded-xl font-extrabold transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    </main>
  );
}