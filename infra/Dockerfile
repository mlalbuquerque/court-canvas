# Usa a versão que definimos no arquivo de configuração
ARG NODE_VERSION=24-alpine
FROM node:${NODE_VERSION}

# Instala o Git (é muito pequeno, cerca de 5MB)
RUN apk add --no-cache git

# Define o diretório de trabalho
WORKDIR /app
