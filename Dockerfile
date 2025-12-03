FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

# Important: ignore peer dependency conflicts
RUN npm install --legacy-peer-deps

COPY . .

# ARG REACT_APP_API_BASE
# ENV REACT_APP_API_BASE=$REACT_APP_API_BASE

RUN npm run build


FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g serve

COPY --from=build /usr/src/app/build ./build

ENV PORT=3000
EXPOSE 3000

ENV API_BASE="http://localhost:4000"

CMD ["serve", "-s", "build", "-l", "3000"]
