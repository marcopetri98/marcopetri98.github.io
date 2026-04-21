FROM node:22-alpine

# Install git (needed for devcontainers and VS Code source control)
RUN apk add --no-cache git \
    openssh-client\
    ca-certificates

RUN update-ca-certificates

WORKDIR /workspace

# Expose Astro's default dev server port
EXPOSE 4321