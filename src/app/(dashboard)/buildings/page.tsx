import MaterialIcon from "@/components/ui/material-icon";

export default function BuildingsPage() {
  return (
    <div className="w-full space-y-3">
      <section className="v-outer-frame">
        <div className="crimson-th p-2 flex items-center justify-between">
          <span className="font-['Chivo'] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
            <MaterialIcon name="domain" size={16} />
            GESTIÓN DE EDIFICIOS
          </span>
        </div>
        <div className="p-4 bg-[#f1ebda] text-[#221c13] font-['Arimo'] text-xs text-center space-y-2">
          <p className="font-bold">Vista centralizada de Edificios e Instalaciones.</p>
          <p className="text-[#695d48]">
            Utiliza la sección <strong className="text-[#801e00]">Habitaciones</strong> del menú para gestionar y ampliar tus instalaciones activas en la propiedad seleccionada.
          </p>
        </div>
      </section>
    </div>
  );
}
