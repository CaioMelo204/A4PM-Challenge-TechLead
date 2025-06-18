FROM node:20 as builder

WORKDIR /app

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

COPY package.json ./

RUN npm install

COPY . ./

FROM builder as dev
CMD ["npm", "run", "dev"]

FROM builder as prod-builder
RUN npm run build

FROM nginx:latest as prod

COPY --from=prod-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]