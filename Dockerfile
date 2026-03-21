FROM node:20.12.2-alpine3.18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS run
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.dev.conf /etc/nginx/nginx.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]