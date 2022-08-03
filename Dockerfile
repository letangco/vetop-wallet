FROM node:12

# Create app directory
RUN mkdir -p /tggs-wallets

# Change workdir
WORKDIR /tggs-wallets

# Copy package.json to app directory
COPY package.json /tggs-wallets/package.json

# Install packages
RUN npm install

# Copy source to app directory
COPY . /tggs-wallets

# Expose
EXPOSE 8013 9013

# Command to start the app
CMD ["npm","run","production"]
