QuantWealth Indexer DB Adapter

This adapter provides the interface for the database used in operations for the QuantWealth ecosystem, focusing on market data and strategy management.

Getting Started
Prerequisites

- MongoDB \(Download and install from MongoDB's official site.\)
  https://www.mongodb.com/docs/manual/installation/
- Node.js
- Yarn

Installation
Run the following command to install dependencies and perform necessary setups:

```
yarn install
```

Booting the Application
Start the application's MongoDB service with:

```
yarn run boot-db
```

You can also install it in your systemd (Linux or MacOS):

```
yarn run install-db
```

Features
Database Operations

- Directory Management: Functions to manage directories of strategies.
- Strategy Management: Functions to upsert strategies.
- Market Data Handling: Functions for appending and inserting time-series data (e.g. for TVL, asset pair data, etc.).

Database Schemas

- Defines data structures for strategies, market data, and associated metrics using Mongoose.

Scripts

- boot: Initializes services.
- install: Sets up project components.

Connecting to the Database
To connect to MongoDB:

```
import { connectIndexerDB } from './index';
connectIndexerDB();
```
