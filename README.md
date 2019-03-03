## Apollo Graphql fullstack
Browse JCDecaux bicycle rent park over the world and browse through:

 - Directions, duration and distance between stations
 - Stations location
 - Stands and bikes availability
 - Point of interest
 - Satellite, terrain and roadmap views

Data obtained from :
 - JCDecaux open data API
 - Google Maps Directions, Geocoder and Distance APIs

## Installation
### Depedencies
Install depedencies by running command in both ***/client*** and ***/server*** directory

    npm install

### API Keys
Create  ***/server/.env*** file and register your API keys as:

    JCDECAUX_API_KEY=XXX-YYY-ZZZ
    GOOGLE_MAPS_API_KEY=XXX-YYY-ZZZ
    ENGINE_API_KEY=service:user-XXX-YYY-ZZZ
    
Create  ***/client/.env*** file and register your API keys as:

    GOOGLE_MAPS_API_KEY=XXX-YYY-ZZZ
## Run project
### Server
Start Apollo Graphql **server** by running in  ***/server*** directory

    npm run build:dev
    npm start
  
Travel to **localhost:4300** to launch GraphQL playground

### Client
Start Apollo Graphql **client** by running in  ***/client*** directory

    npm start
   Travel to **localhost:4400** to launch app

## Deploy serverless
Coming soon


