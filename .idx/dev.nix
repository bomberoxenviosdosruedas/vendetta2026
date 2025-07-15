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
    pkgs.prisma
  ];
  # Sets environment variables in the workspace
  env = {
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19NdUJQaGJDZkE0YUZOMElOb2VnbWwiLCJhcGlfa2V5IjoiMDFLMDYzUUQ0TktOR0pLMDVQQkIwV1NFMFMiLCJ0ZW5hbnRfaWQiOiJkYmNkMTU4NTdjZWI1ZGJiODZiYWY3MDg4OGI4ZGYzY2M1YTYzNWM4MmI3MWUyZGEyM2ViYmE5NDJmMDNmZWYzIiwiaW50ZXJuYWxfc2VjcmV0IjoiNTc4MmUxZWItNjdlZS00MDQ5LTlmNmEtYTMxOTcyYWY1ZjAyIn0.3KpxZ4Y6fCPXmY1cznWJGdNVBM3OBEH2-3gaw38n96Q";
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
