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

# Monta volumes dinamicamente baseado na disponibilidade do ambiente
VOLUMES=(
  -v "$(pwd):/app"
  -v "$CACHE_VOL:/cache/npm"
  -v "$HOME/.gitconfig:/etc/gitconfig:ro"
)

ENV_VARS=(
  -e "npm_config_cache=/cache/npm"
)

# Adiciona SSH agent se disponível
if [ -n "$SSH_AUTH_SOCK" ]; then
  VOLUMES+=(-v "$SSH_AUTH_SOCK:/run/ssh-agent")
  ENV_VARS+=(-e "SSH_AUTH_SOCK=/run/ssh-agent")
fi

# Condicional para TTY (evita erro no Husky)
[[ -t 0 ]] && TTY_OPTS="-it" || TTY_OPTS="-i"

# Executa o Docker
docker run --rm $TTY_OPTS \
  --init \
  --name "court-canvas-node-$(date +%s)" \
  -u "$(id -u):$(id -g)" \
  -p 5173:5173 \
  -p 4173:4173 \
  "${VOLUMES[@]}" \
  "${ENV_VARS[@]}" \
  -w /app \
  "$IMAGE_NAME" "$@"
