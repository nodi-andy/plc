FROM node:20
RUN npm install -g npm@10.5.0

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev
# Bundle app source
COPY . .

# Fetch all git submodules under /public
RUN git submodule update --init --recursive /public

# Build React interface if not built previously
RUN if [ ! -d "build" ]; then npm run build; fi

EXPOSE 80
CMD [ "node", "server.mjs" ]