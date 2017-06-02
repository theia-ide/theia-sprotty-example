# theia-sprotty-example
An example application integrating graphical [sprotty](https://github.com/TypeFox/sprotty) views for an [Xtext](http://www.xtext.org)-based DSL with [Theia](https://github.com/theia-ide/theia)

## Build and Run
After checking out sprotty, Theia and this repository into the same root directory, do
```bash
git clone git@github.com:theia-ide/theia.git
git clone git@github.com:TypeFox/sprotty.git
git clone git@github.com:TypeFox/theia-sprotty-example.git

# Build sprotty server framework
cd sprotty/server
./gradlew install
cd ../client
npm install
npm run build
cd ../..

# Prepare Theia 
cd theia
npm install
npm run build
cd ..

# Build the diagram aware language server for the example DSL
cd theia-sprotty-example/server
./gradlew installDist
cd ..

# Prepare the Theia extension for the example DSL
cd theia-dsl-extension
npm install
cd ..

# Build the Theia app
cd theia-app
npm install
npm run build

# Start the Theia app
npm run start
```
