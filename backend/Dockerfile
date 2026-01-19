FROM node:20-alpine

WORKDIR /app

# ===============================
# DEPENDENCIAS
# ===============================
COPY package*.json ./
RUN npm install

# ===============================
# CÓDIGO
# ===============================
COPY . .

# ===============================
# BUILD TYPESCRIPT
# ===============================
RUN npm run build

# ===============================
# PUERTO
# ===============================
EXPOSE 3000

# ===============================
# START (ARCHIVO CORRECTO)
# ===============================
CMD ["node", "dist/server.js"]
