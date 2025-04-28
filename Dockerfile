# Usamos una imagen oficial de Node.js como base
FROM node:18

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los ficheros de dependencias y los instalamos
COPY package.json package-lock.json* ./
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Exponemos el puerto que usa Next.js
EXPOSE 3000

# Comando para iniciar tu CRUD en modo desarrollo
CMD ["npm", "run", "dev"]
