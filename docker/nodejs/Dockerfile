FROM node:25-slim

RUN apt-get update && apt-get install -y git && apt-get clean

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN  npm install -g pnpm@9.15.0 && \
     # See https://github.com/pnpm/pnpm/issues/5803
     pnpm config set store-dir $PNPM_HOME/store

WORKDIR /app

# See: https://docs.docker.com/reference/dockerfile/#copy---parents
# COPY --parents package.json apps/*/package.json packages/*/package.json ./
COPY ./package.json .
COPY ./pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile 

COPY . .
