let
  pkgs = import <nixpkgs> {};
in
pkgs.mkShell {
  packages = [
    (pkgs.python3.withPackages (pythonPackages: with pythonPackages; [
      # Web app
      fastapi
      uvicorn
      jinja2

      # Configuration
      python-dotenv

      # HTTP / APIs
      httpx

      # Microsoft / Outlook
      msal

      # Google / Gmail
      google-api-python-client
      google-auth
      google-auth-oauthlib

      # Database
      sqlalchemy
    ]))

    # Python tooling
    pkgs.pipx
    pkgs.poetry

    # NPM nodejs
    pkgs.nodejs
  ];

  env = {
    LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc
      pkgs.libxcrypt
    ];

    POETRY_VIRTUALENVS_IN_PROJECT = "true";
    POETRY_VIRTUALENVS_PATH = "{project-dir}/.venv";
    POETRY_VIRTUALENVS_PREFER_ACTIVE_PYTHON = "true";
  };
}
