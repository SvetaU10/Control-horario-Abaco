FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# ⬇️ CORREGIDO: Cada palabra debe ir en sus propias comillas separadas por coma ⬇️
CMD ["npm", "run", "dev"]
