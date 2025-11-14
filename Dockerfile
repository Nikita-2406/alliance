FROM node:18

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .

# Файлы из public/ автоматически будут доступны
RUN yarn build

EXPOSE 3000

CMD ["yarn", "preview", "--host", "0.0.0.0"]