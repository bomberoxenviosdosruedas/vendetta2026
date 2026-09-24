import MaterialIcon from "@/components/ui/material-icon";

export default function SearchPage() {
  return (
    <div className="w-full space-y-3">
      <section className="v-outer-frame">
        <div className="crimson-th p-2 flex items-center justify-between">
          <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <MaterialIcon name="search" size={16} />
            BÚSQUEDA AVANZADA
          </span>
        </div>

        <div className="p-4 bg-[#f1ebda] text-[#221c13] font-['Arimo'] text-xs text-center space-y-2">
          <p className="font-bold">Búsqueda Global de Jugadores, Familias y Coordenadas.</p>
          <p className="text-[#695d48]">
            Utiliza las secciones <strong className="text-[#801e00]">Mapa</strong> y <strong className="text-[#801e00]">Clasificación</strong> del menú para localizar familias y rivales en el servidor.
          </p>
        </div>
      </section>
    </div>
  );
}
