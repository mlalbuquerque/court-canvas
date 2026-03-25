# Usa a versão que definimos no arquivo de configuração
ARG NODE_VERSION=24-alpine
FROM node:${NODE_VERSION}

# Instala Git e dependências necessárias para rodar o Playwright (binários oficiais) no Alpine
# libc6-compat é essencial para rodar binários compilados para glibc
RUN apk add --no-cache \
    git \
    libc6-compat \
    libstdc++ \
    nss \
    freetype \
    ttf-freefont \
    harfbuzz \
    ca-certificates

# Define o diretório de trabalho
WORKDIR /app
