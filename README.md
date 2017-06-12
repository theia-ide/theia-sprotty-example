# theia-sprotty-example
An example application integrating graphical [sprotty](https://github.com/TypeFox/sprotty) views for an [Xtext](http://www.xtext.org)-based DSL with [Theia](https://github.com/theia-ide/theia)

[![sprotty Theia Demo](./sprotty_theia_demo_screenshot.png)](http://www.youtube.com/watch?v=S8WCwwfHDfU "sprotty Theia Demo")

## Build and Run

```bash
git clone git@github.com:TypeFox/theia-sprotty-example.git

# Build the diagram-aware language server for the example DSL
cd theia-sprotty-example/server
./gradlew installDist
cd ..

# Prepare the Theia extension for the example DSL
cd theia-dsl-extension
npm install
cd ..
```

To run the Theia web app:
```bash
# Build and run the Theia webapp
cd theia-app
npm install
npm run build
npm run start
```

To run the Theia Electron app
```bash
# Build and run the Theia Electron app
cd theia-electron
npm install
npm run build
npm run start
```

## How to Use the Examples

 * Expand the files browser on the left.
 * Double-click an example file to open it. You'll get a text editor with language support for [the multicore DSL](https://github.com/TypeFox/theia-sprotty-example/blob/master/server/io.typefox.sprotty.example.multicore/src/main/java/io/typefox/sprotty/example/multicore/MulticoreAllocation.xtext) powered by [Xtext](http://www.xtext.org). The DSL describes the execution of parallel algorithms on many-core processors.
 * Right-click the same file in the files browser and select "Open With &rarr; Flow diagram". You'll see a graph view of the tasks and barriers in the DSL file, with automatic layout powered by [ELK](https://www.eclipse.org/elk/).
 * Drag the graph view tab to the right to get a side-by-side layout.
 * Right-click the file again, select "Open With &rarr; Processor diagram", and drag the new tab to the bottom right (below the graph view).
 * Click on task nodes in the graph view and observe how the application adapts to that selection. Clicking on the black background also has an effect if you previously selected a task node.
 * The same kind of view synchronization is done if you click on a color-highlighted core in the processor view.
