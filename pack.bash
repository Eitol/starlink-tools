#!/bin/bash

npm run build

# Nombre del archivo zip
ZIP_NAME="starlink-tools.zip"


# Eliminar el zip anterior si existe
rm -f "$ZIP_NAME"

# Cambiar al directorio donde está el script
cd "$(dirname "$0")"

mkdir -p "pack"

cp -r public/* pack
cp -r out/* pack

# Añadir el directorio public completo
cd pack
zip -r "$ZIP_NAME" ./*

echo "La extensión ha sido empaquetada en $ZIP_NAME"