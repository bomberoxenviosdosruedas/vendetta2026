
{ pkgs, ... }: {
  # Entorno de desarrollo para un proyecto Next.js con bun.
  # https://nix.dev/getting-started/install-nix

  # Paquetes a instalar.
  # pkgs es el conjunto de paquetes de Nix, aquí estamos seleccionando nodejs y bun.
  packages = [
    pkgs.nodejs_20  # Entorno de ejecución de JavaScript y npm.
    pkgs.bun        # Un toolkit de JavaScript rápido que incluye un bundler, un ejecutor y un gestor de paquetes.
  ];

  # Opciones para procesos que se ejecutan en el entorno.
  process.main.command = "npm install && npm run dev";

  # Opciones para el editor.
  # Habilita el formateador de Nix para archivos .nix.
  # Si tienes problemas, intenta ejecutar `nix fmt` en la terminal.
  editor.formatOnSave.enable = true;

  # Configuraciones para el previsualizador de IDX.
  # https://developers.google.com/idx/guides/preview
  previews = [
    {
      # Previsualización para el servidor de desarrollo de Next.js.
      command = ["npm", "run", "dev", "-p", "$PORT"];
      manager = "web";
    }
  ];
}
