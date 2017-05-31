# theia-sprotty-example
An example application integrating Sprotty views for an Xtext-based DSL with Theia

## Run it
```
# Build the diagram aware language server for the example DSL
cd server
./gradlew installDist
cd ..
# Build the Theia extension
cd theia-dsl-extension
npm install
npm run build
cd ..
# Build the Theia app
cd theia-app
npm install
npm run build
# Start the Theia app
npm run start
```

