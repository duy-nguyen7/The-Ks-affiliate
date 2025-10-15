FROM node:20-alpine

WORKDIR /app

# chỉ copy files khai báo để tối ưu cache
COPY package*.json ./

# cài deps production (không cần lockfile)
RUN npm install --omit=dev

# copy source
COPY . .

# Cloud Run sẽ cấp PORT=8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]