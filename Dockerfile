# Base image
FROM node:21-alpine3.19

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY yarn.lock package*.json ./

# Bundle app source
COPY . .

# Install app dependencies
RUN yarn install --frozen-lockfile

# Creates a "dist" folder with the production build
RUN yarn build:nova

# Start the server using the production build
CMD [ "node", "packages/agents/nova/dist/main.js" ]
