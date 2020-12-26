import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder
}
from "@babylonjs/core";

class App {
    constructor() {
        //Create the canvas HTML element and attach it to the webpage
        //We are doing this as webpack is injecting our JS code into the body of the HTML site
        var canvas = document.createElement("canvas");
        canvas.classList.add("bJsCanvas");
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);

        // Initilize the babylon scene and engine
        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);

        var camera: ArcRotateCamera = new ArcRotateCamera(
            "Camera",       //name, what are we calling the camera
            Math.PI / 2,    //alpha, rotation along longitudinal axis
            Math.PI / 2,    //beta, rotation along latitudinal axis
            2,              //radius, distance between camera and target (??)
            Vector3.Zero(), //target, where are we pointing
            scene);         //scence, which scence the camera belongs to
        camera.attachControl(canvas, true);

        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1,1,0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1}, scene);

        // hide/show the Inspector for DEBUGGING
        window.addEventListener("keydown", (ev) => {
            //Shift+Ctrl+Alt+I
            if(ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === 'KeyI'){
                scene.debugLayer.isVisible() ? scene.debugLayer.hide() : scene.debugLayer.show();
            }
        });

        // Run the MAIN render loop
        engine.runRenderLoop(() => {
            scene.render();
        })
    }
}

//Lets GOOOOOOOOOOO
new App();