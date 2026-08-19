FROM node:22-bookworm-slim

# Dependências do Chromium headless requeridas pelo Remotion
# NÃO fixe versões de pacotes apt — URL do Chromium no registro muda e pin quebra o build
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libgbm-dev \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libatk-bridge2.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libcups2 \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Manifesto de dependências primeiro (melhor cache de layer)
COPY package.json package-lock.json* ./
COPY tsconfig.json remotion.config.ts ./

RUN npm ci

# Instala o Chrome gerenciado pelo Remotion
RUN npx remotion browser ensure

# Código-fonte
COPY src ./src

# Server e avatar commitado
COPY server.js ./
COPY assets/avatar.png ./assets/

# Garante que pastas de volume existam
RUN mkdir -p assets/imagens assets/musica output

EXPOSE 3001

CMD ["node", "server.js"]
