{ pkgs ? import <nixpkgs> {} }:

let
  python = pkgs.python3;
  pythonPackages = python.pkgs;
in

pythonPackages.buildPythonApplication {
  pname = "certificate-management-system";
  version = "0.1.0";
  
  src = ./backend;
  
  propagatedBuildInputs = with pythonPackages; [
    fastapi
    uvicorn
    sqlalchemy
    alembic
    pydantic
    asyncpg
    psycopg2
    python-jose
    passlib
    python-multipart
    pyopenssl
    cryptography
  ];
  
  checkInputs = with pythonPackages; [
    pytest
    pytest-asyncio
    httpx
  ];
  
  checkPhase = ''
    pytest
  '';
  
  meta = with pkgs.lib; {
    description = "A comprehensive system for managing X509 certificates";
    homepage = "https://github.com/yourusername/certificate-management-system";
    license = licenses.mit;
    maintainers = with maintainers; [ yourusername ];
  };
}