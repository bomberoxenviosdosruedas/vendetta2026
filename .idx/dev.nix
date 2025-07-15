# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs }: {
  # Which nixpkgs channel to use.
  channel = "stable-25.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs
    pkgs.openssl
    pkgs.bun
    pkgs.python313
  ];
  # Sets environment variables in the workspace
  env = {
    DATABASE_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza180RFp1ZGlhWldrOEpBSXA1V3NmS3YiLCJhcGlfa2V5IjoiMDFLMDYyQVMwM0ZWVkFOWUpYS004WkU2M1ciLCJ0ZW5hbnRfaWQiOiI5YmUxYTk0MDgwNGZkNzc4ZTkxZGNmYmEzMjc5ZmY1OWY3ZjUyNTc0YjlkYzRkMDA0YTc0MGFiNDRjOGZlNThjIiwiaW50ZXJuYWxfc2VjcmV0IjoiZTYxMTljOTEtZGMwNS00M2RiLWIyN2EtMGY2MzYyYjc2MTYxIn0.Xx0zloGB6Q1MS67-ac8i3L_gxElEUUYu7Yov6u1w27o";
    };
    # This adds a file watcher to startup the firebase emulators. The emulators will only start if
    # a firebase.json file is written into the user's directory
    services.firebase.emulators = {
      detect = true;
      projectId = "demo-app";
      services = [ "auth" "firestore" ];
    };
    idx = {
      # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
      extensions = [
        # "vscodevim.vim"
      ];
      workspace = {
        onCreate = {
          default.openFiles = [
            "src/app/page.tsx"
          ];
        };
      };
      # Enable previews and customize configuration
      previews = {
        enable = true;
        previews = {
          web = {
            command = [ "npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0" ];
            manager = "web";
          };
        };
      };
    };
  }
