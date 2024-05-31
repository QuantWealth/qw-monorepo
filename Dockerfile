# Base image
FROM node:21-alpine3.19

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY yarn.lock tsconfig*.json package*.json ./
RUN ls -la

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

RUN yarn global add typescript
RUN yarn workspace qw-utils run build
RUN yarn workspace qw-orderbook-db build
# Creates a "dist" folder with the production build
RUN yarn workspace qw-nova build

# Start the server using the production build
CMD [ "node", "packages/agents/nova/dist/main.js" ]
