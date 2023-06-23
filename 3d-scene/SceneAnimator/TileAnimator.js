import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {Animator} from './Animator.js'
import * as LerpFunc from '../utils/Lerp.js';

import {BuildingTile, TwoWayConectionLine} from './TileElements.js'


export class TileAnimator extends Animator
{
    #LineArray = [];
    #TileArray = [];

    #isLoaded = false;
    #isAnimationEnded = true;
    #animationStartTime;

    constructor(scene, position, rotation, scale, bloomPass)
    {
        if(scene == undefined)
        {
            return;
        }
        if(position == undefined)
        {
            return;
        }
        if(rotation == undefined)
        {
            return;
        }
        if(scale == undefined)
        {
            return;
        }
        super(scene, position, rotation, scale);
        this.LoadModel(scene, position, rotation, scale, bloomPass);
    }

    async LoadModel(scene, position, rotation, scale, bloomPass)
    {
        var Tile1 = new BuildingTile(position.x + 100, position.y, position.z + 20, scale, true, scene, bloomPass);
        var Tile2 = new BuildingTile(position.x + 100, position.y, position.z - 20, scale, true, scene, bloomPass);
        var Tile3 = new BuildingTile(position.x + 75, position.y, position.z - 65, scale, true, scene, bloomPass);
        var Tile4 = new BuildingTile(position.x + 75, position.y, position.z + 65, scale, true, scene, bloomPass);

        Tile1.AddToBloomSelection(bloomPass);
        Tile2.AddToBloomSelection(bloomPass);
        Tile3.AddToBloomSelection(bloomPass);
        Tile4.AddToBloomSelection(bloomPass);

        Tile1.isPopedUp = true;
        Tile2.isPopedUp = true;
        Tile3.isPopedUp = true;
        Tile4.isPopedUp = true;

        var TileMain = new BuildingTile(position.x, position.y, position.z, scale, true, scene, bloomPass);
        TileMain.AddToBloomSelection(bloomPass);

        this.#TileArray.push(TileMain);
        this.#TileArray.push(Tile4);
        this.#TileArray.push(Tile1);
        this.#TileArray.push(Tile2);
        this.#TileArray.push(Tile3);

        this.#LineArray.push(new TwoWayConectionLine([5, 0, -65, -35, 0, -65, -35, 0, 0, -70, 0, 0],
            [5, 0, -65, -35, 0, -65, -35, 0, 0, -70, 0, 0],
            1, 0.4, scene
        ));
        this.#LineArray.push(new TwoWayConectionLine([5, 0, 65, -35, 0, 65, -35, 0, 0],
            [5, 0, 65, -35, 0, 65, -35, 0, 0, -70, 0, 0],
            1, 0.5, scene
        ));
        this.#LineArray.push(new TwoWayConectionLine([30, 0, 20, -15, 0, 20, -15, 0, 0, -35, 0, 0],
            [30, 0, 20, -15, 0, 20, -15, 0, 0, -70, 0, 0], 
            1, 0.6, scene
        ));
        this.#LineArray.push(new TwoWayConectionLine([30, 0, -20, -15, 0, -20, -15, 0, 0],
            [30, 0, -20, -15, 0, -20, -15, 0, 0, -70, 0, 0],
            1, 0.7, scene
        ));

        
        if(bloomPass != undefined)
        {
            this.#LineArray[0].AddToBloomSelection(bloomPass);
            this.#LineArray[1].AddToBloomSelection(bloomPass);
            this.#LineArray[2].AddToBloomSelection(bloomPass);
            this.#LineArray[3].AddToBloomSelection(bloomPass);
        }
        this.#isLoaded = true;

        this.rootObject = TileMain.root;
    }


    UpdateLoop()
    {
        if(!this.#isLoaded)
        {
            return;
        }

        this.#LineArray[0].UpdateSphere();
        this.#LineArray[1].UpdateSphere();
        this.#LineArray[2].UpdateSphere();
        this.#LineArray[3].UpdateSphere();

        if(!this.#isAnimationEnded)
        {
            this.#animationStartTime = performance.now() + 1000;
            this.#isAnimationEnded = !this.#isAnimationEnded;
        }

        this.#PopUpAnimation();
    }

    StartAnimation()
    {
        this.#isAnimationEnded = false;
    }

    ResetAnimation()
    {
        if(!this.#isLoaded)
        {
            return;
        }
        for (let i = 0; i < this.#TileArray.length; i++)
        {
            this.#TileArray[i].Reset();
        }
        this.UnlockAnimation();
    }

    #PopUpAnimation()
    {
        var speed = 150;
        var normilizedTime;

        for (let i = 0; i < this.#TileArray.length * speed; i = i + speed)
        {
            if(this.#animationStartTime + i < performance.now() && performance.now() < this.#animationStartTime + 1000 + i)
            {
                normilizedTime = (performance.now() - (this.#animationStartTime + i)) / ((this.#animationStartTime + 1000 + i) - (this.#animationStartTime + i));
                this.#TileArray[i / speed].PopUp(LerpFunc.EaseInLerp(0, 1, normilizedTime));
            }
        }
    }
}