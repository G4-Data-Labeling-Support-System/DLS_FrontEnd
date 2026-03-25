#====== Builder Stage ======
FROM node:20.12.2-alpine3.18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

ARG MODE=dev
RUN npm run build -- --mode=$MODE

#====== Runner Stage ======
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
ARG MODE=dev
COPY nginx.${MODE}.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]