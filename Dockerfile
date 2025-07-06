# Gunakan Node.js versi 18 sebagai base image
FROM node:18-alpine

# Set direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependensi proyek
RUN npm install

# Salin seluruh kode aplikasi ke direktori kerja
COPY . .

# Paparkan port yang akan digunakan aplikasi
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
