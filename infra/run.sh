#!/bin/bash

# Detecta a pasta onde o script está para encontrar o node-version
INFRA_DIR="$(cd "$(dirname "$0")" && pwd)"
VERSION=$(cat "$INFRA_DIR/node-version")

# Nome da imagem customizada
IMAGE_NAME="court-canvas-node-dev:$VERSION"

# Verifica se a imagem já existe localmente, caso contrário, constrói
if [[ "$(docker images -q "$IMAGE_NAME" 2> /dev/null)" == "" ]]; then
  echo "--- Construindo imagem customizada ($IMAGE_NAME)... ---"
  docker build \
    --build-arg NODE_VERSION="$VERSION" \
    -t "$IMAGE_NAME" \
    "$INFRA_DIR"
fi

# Nome do volume para persistência do cache do NPM
CACHE_VOL="court-canvas-npm-cache"
docker volume create $CACHE_VOL > /dev/null 2>&1

# Executa o Docker
# -u: Garante que os arquivos gerados (node_modules, etc) pertençam a você no Linux
# -v: Monta o código atual em /app, o cache em /cache/npm, as chaves SSH e a configuração global do Git
# -e: Informa ao NPM para usar a pasta de cache otimizada e o socket do agente SSH
# -w: Define o diretório inicial do container como /app
docker run --rm -it \
  --name "court-canvas-node-$(date +%s)" \
  -u "$(id -u):$(id -g)" \
  -v "$(pwd):/app" \
  -v "$CACHE_VOL:/cache/npm" \
  -v "$SSH_AUTH_SOCK:/run/ssh-agent" \
  -v "$HOME/.gitconfig:/etc/gitconfig:ro" \
  -e "npm_config_cache=/cache/npm" \
  -e "SSH_AUTH_SOCK=/run/ssh-agent" \
  -w /app \
  "$IMAGE_NAME" "$@"
