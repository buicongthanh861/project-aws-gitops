FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci
COPY . .
# Sửa lỗi: Thêm biến môi trường để tương thích với OpenSSL 3 trên Node 20
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

FROM nginx:stable-alpine
WORKDIR /app
COPY --from=builder /app/build/ /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
