FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install --legacy-peer-deps
# Force compatible ajv v6 stack (react-scripts needs ajv@6, not ajv@8)
RUN npm install ajv@6.12.6 ajv-formats@1.6.1 ajv-keywords@3.5.2 --save --legacy-peer-deps && npm dedupe
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
