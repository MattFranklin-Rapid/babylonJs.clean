import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";

import {
    Engine,
    Scene,
    Vector3,
    Mesh,
    Color3,
    Color4,
    ShadowGenerator,
    GlowLayer,
    PointLight,
    FreeCamera,
    CubeTexture,
    Sound,
    PostProcess,
    Effect,
    SceneLoader,
    Matrix,
    MeshBuilder,
    Quaternion,
    AssetsManager,
    HemisphericLight,
    ArcRotateCamera
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    StackPanel,
    Button,
    TextBlock,
    Rectangle,
    Control,
    Image
} from "@babylonjs/gui";
import { btd, dtt } from './colorHelp';
/*import { PlayerInput } from "./inputController";
import { Player } from "./characterController";
import { Hud } from "./ui";
import { Environment } from "./environment";*/

enum State {
    START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3
};

class App {
    //General gloabals for whole App
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    //Game state globals

    //Sounds

    //Scene related
    private _gameScene: Scene;
    private _state: number = 0;
    private _cutScene: Scene;

    //Post processing

    

    constructor() {
        this._canvas = this._createCanvas();
        


        //Init the Babylon engine and scene
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);
        this._gameScene = new Scene(this._engine);
        this._cutScene = new Scene(this._engine);

        // hide/show the Inspector for DEBUGGING
        window.addEventListener("keydown", (ev) => {
            //Shift+Ctrl+Alt+I  - You know, for INSPECTOR
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.code === 'KeyI') {
                this._scene.debugLayer.isVisible() ?
                    this._scene.debugLayer.hide() :
                    this._scene.debugLayer.show();
            }
        });

        // Run the MAIN render loop
        this._main();
    } // End Constructor

    /**
     * Generate a canvas element and set it up with our styles
     */
    private _createCanvas(): HTMLCanvasElement {
        this._canvas = document.createElement("canvas");
        this._canvas.classList.add("bJsCanvas")
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    /**
     * For some reason there's no helpful constructor for the Button class in Babylon. This overloads that for conveience.
     * This overloads Button.CreateSimpleButton
     * @param {string} name : Name of the button itself, used to refer to it
     * @param {string} text : Text displayed on the button
     * @param {string|number} width : Width of button, can be 0 - 1 percentage or "14px" for 14 pixels
     * @param {string|number} height : Height of button, can be 0 - 1 percentage or "14px" for 14 pixels
     * @param {string} color : Colour of the button
     * @param {string} top : As with CSS, top co-ordinate of control. Use like "-14px"
     * @param {number} thickness : Border thickness
     * @param {Control enum} verticalAlignment : Vertical alignment, defaults to bottom
     */
    private _createButton(name: string, text: string, width: string | number, height: string | number, color: string, top: string = "0px", thickness: number = 0, verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM): Button {
        let button = Button.CreateSimpleButton(name, text);
        button.width = width;
        button.height = height;
        button.color = color;
        button.top = top;
        button.thickness = thickness;
        button.verticalAlignment = verticalAlignment;
        return button;
    } //

    /**
     * Handy Helper for creating cameras. I got sick of having to type the same bloody defaults so I baked them into this
     * @param name : REQUIRED. The name of the camera
     * @param alpha : Longitudinal axis rotation, defaults Math.PI /2
     * @param beta  : latitudinal axis rotation, defaults Math.PI /2
     * @param radius : The radius, defaults 2
     * @param target : Target, defaults vector zero
     * @param scene : REQUIRED. The scene to attach the camera to
     */
    private _createCamera(name:string , scene, alpha = Math.PI/2, beta = Math.PI/2, radius = 2, target = Vector3.Zero()): ArcRotateCamera{
        let camera: ArcRotateCamera = new ArcRotateCamera(
            name, //name, what are we calling the camera
            alpha, //alpha, rotation along longitudinal axis
            beta, //beta, rotation along latitudinal axis
            radius, //radius, distance between camera and target (??)
            target, //target, where are we pointing
            scene); //scene, which scence the camera belongs to
        return camera;
    }

    /**
     * State controller for one time events - Starting
     * Handles the loading state
     */
    private async _goToStart() {
        //Display loading UI as app is loading
        this._engine.displayLoadingUI();

        //Generate the scene and remove control
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //Generate GUI
        //Create UI to put our GUI on
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720; //720p Baby

        //Create a button
        const startBtn = this._createButton("start", "PLAY", 0.2, "40px", "white", "-14px", 0);
        guiMenu.addControl(startBtn);

        //Handle interactions with the button
        startBtn.onPointerDownObservable.add(() => {
            this._goToCutScene();
            scene.detachControl();
        })



        // Scene has finished loading
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //Time to ditch this Start state and go to the main state
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;

    } //End _goToStart

    /**
     * Cutscene state handling
     */
    private async _goToCutScene(): Promise<void>{
        this._engine.displayLoadingUI();

        //Set up the scene
        this._scene.detachControl();
        this._cutScene = new Scene(this._engine);
        let camera = new FreeCamera("camera1", new Vector3(0,0,0), this._cutScene);
        camera.setTarget(Vector3.Zero());

        //Set up GUI
        const cutScene = AdvancedDynamicTexture.CreateFullscreenUI("cutscene");

        //Populate GUI with Next button
        const next = this._createButton("next", "NEXT", "64px", "64px", "white", "-3%");
        next.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        next.left = "-12%";
        cutScene.addControl(next);

        //Handle clicking that next button
        next.onPointerDownObservable.add(() => {
            this._goToGame();
        });

        //The scene has finished loading
        await this._cutScene.whenReadyAsync();
        this._engine.hideLoadingUI();
        this._scene.dispose();
        this._state = State.CUTSCENE;
        this._scene = this._cutScene;

        //Load the game state during the cutscene 'cause I'm a badass
        var finishedLoading = false;
        await this._setUpGame().then(res => {
            finishedLoading = true;
        });


    }//End _goToCutScene

    /**
     * Lose state handling
     */
    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        //Set up Scene
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);
        let camera = new FreeCamera("camera1", new Vector3(0,0,0), scene);
        camera.setTarget(Vector3.Zero());

        //Hook up GUI
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = this._createButton("mainmenu", "MAIN MENU", 0.2, "40px", "white");
        guiMenu.addControl(mainBtn);

        //Handle button click
        mainBtn.onPointerDownObservable.add(() => {
            this._goToStart();
        });

        //The scene has finished loading
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //Finally set the current state of the app to LOSE
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;

    }//End _goToLose

    private async _setUpGame(){
        let scene = new Scene(this._engine);
        this._gameScene = scene;

        //Load assets here...

    }//End _setUpGame

    /**
     * Gameplay loop handling
     */
    private async _goToGame(): Promise<void>{
        //Set up scene
        this._scene.detachControl();
        let scene = this._gameScene;

        scene.clearColor = new Color4(btd(0), btd(166), btd(37)); //Cool Colours Bruh
        let camera: ArcRotateCamera = this._createCamera("Camera", scene);
        camera.setTarget(Vector3.Zero());

        //Set up GUI
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //Remove control while loading (We are loading RIGHT NOW 😱)
        scene.detachControl();

        //Create suicide button
        const loseBtn = this._createButton("lose", "LOSE", 0.2, "40px", "white", "-14px", 0);
        playerUI.addControl(loseBtn);

        //Handle pressing the sucide button
        loseBtn.onPointerDownObservable.add(() => {
            this._goToLose();
            scene.detachControl(); //Get killd
        });

        //Set up temp scene objects so we can see something
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1,1,0), scene);
        var sphere: Mesh = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);

        //Ditch the start screen, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        this._engine.hideLoadingUI();
        //Time to get control back
        this._scene.attachControl();

    }//End _goToGame

    /**
     *      || MAIN BABY! ||
     */
    private async _main(): Promise<void>{
        await this._goToStart();

        //Register a render loop to repeatly render the scene
        this._engine.runRenderLoop(() => {
            switch (this._state){
                case State.START:
                    this._scene.render();
                    break;
                case State.CUTSCENE:
                    this._scene.render();
                    break;
                case State.GAME:
                    this._scene.render();
                    break;
                case State.LOSE:
                    this._scene.render();
                    break;
                default: break;
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        })

    }
}

//Lets GOOOOOOOOOOO
new App();