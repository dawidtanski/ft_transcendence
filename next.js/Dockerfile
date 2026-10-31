FROM node:24-bookworm

WORKDIR /src/app
RUN chown node:node /src/app
USER node

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --include=optional
# Debian uses glibc; Turbopack requires the matching native SWC binary.
RUN node -e 'require("@next/swc-linux-" + process.arch + "-gnu")'

COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
