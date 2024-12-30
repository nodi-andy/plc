FROM node:20
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY . .
RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev
# Bundle app source


# Build React interface if not built previously
RUN if [ ! -d "build" ]; then npm run build; fi

EXPOSE 8080
CMD [ "node", "server.mjs" ]