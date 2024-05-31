# Base image
FROM node:21-alpine3.19

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY yarn.lock tsconfig*.json package*.json ./

# Install app dependencies
RUN yarn

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN yarn build

# Start the server using the production build
CMD [ "node", "packages/agents/nova/dist/main.js" ]
