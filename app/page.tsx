 export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-4xl font-bold">
        CRM SBL Andorra 🚀
      </h1>

      <p className="mt-4 text-lg">
        Bienvenido David. Aquí vamos a gestionar:
      </p>

      <ul className="mt-4 list-disc ml-6 text-lg">
        <li>Clínicas y especialistas</li>
        <li>Visitas comerciales</li>
        <li>Pedidos y margen</li>
        <li>Productos: PRP, MCT, Biotech, Bliss</li>
      </ul>

      <button className="mt-6 px-4 py-2 bg-black text-white rounded-xl">
        + Añadir clínica
      </button>
    </main>
  );
}
