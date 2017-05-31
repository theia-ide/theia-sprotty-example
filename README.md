# theia-sprotty-example
An example application integrating graphical [sprotty](https://github.com/TypeFox/sprotty) views for an [Xtext](http://www.xtext.org)-based DSL with [Theia](https://github.com/theia-ide/theia)

## Build and Run
```bash
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
