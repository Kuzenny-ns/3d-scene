import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {Animator} from './Animator.js'
import * as LerpFunc from '../utils/Lerp.js';

function clamp(value, min, max)
{
	return Math.min(Math.max(value, min), max);
}

export class SafeAnimator extends Animator
{
    #Safe;
    #Door;
    #DoorHandle
    #Block;
    #Chain;

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
        const loader = new GLTFLoader();
        const result = await loader.loadAsync('3D_models/Safe/safe_model2.gltf');
        
        let tmep_scene = result.scene;

        this.#Safe = tmep_scene.getObjectByName( 'safe_model' );
        this.#Safe.parent.remove(this.#Safe);

        this.#Door = tmep_scene.getObjectByName( 'door_model' );
        this.#Door.parent.remove(this.#Door);

        this.#DoorHandle = tmep_scene.getObjectByName( 'doorhandle_model' );
        this.#DoorHandle.parent.remove(this.#DoorHandle);

        this.#Block = tmep_scene.getObjectByName( 'blockchain_model' );
        this.#Block.parent.remove(this.#Block);

        this.#Chain = tmep_scene.getObjectByName( 'chain_model' );
        this.#Chain.parent.remove(this.#Chain);

        scene.add(this.#Safe);

        let old_DoorHandle_position = this.#DoorHandle.position;
        this.#Door.add(this.#DoorHandle);
        this.#Safe.add(this.#Door);

        this.#Block.add(this.#Chain);
        this.#Safe.add(this.#Block);


        this.#Safe.position.x = position.x;
        this.#Safe.position.y = position.y;
        this.#Safe.position.z = position.z;

        this.#Safe.rotation.x = rotation.x * THREE.MathUtils.DEG2RAD;
        this.#Safe.rotation.y = rotation.y * THREE.MathUtils.DEG2RAD;
        this.#Safe.rotation.z = rotation.z * THREE.MathUtils.DEG2RAD;

        this.#DoorHandle.rotation.set(0, 0, 0);

        this.#Safe.scale.set(scale, scale, scale);

        this.#Chain.position.set(0, 0, 0);

        this.#DoorHandle.position.set(old_DoorHandle_position.x - this.#Door.position.x,
            old_DoorHandle_position.y - this.#Door.position.y,
            old_DoorHandle_position.z - this.#Door.position.z
        );
        if(bloomPass != undefined)
        {
            bloomPass.selection.add(this.#Door);
            bloomPass.selection.add(this.#DoorHandle);
            bloomPass.selection.add(this.#Safe);
        }
        this.#isLoaded = true;

        this.rootObject = this.#Safe;
        this.SetAllProperties();
    }


    UpdateLoop(cameraPosition, min, max)
    {
        if(!this.#isLoaded)
        {
            return;
        }
        this.#Block.rotation.y += 1 * THREE.MathUtils.DEG2RAD;

        if(!this.#isAnimationEnded)
        {
            this.#animationStartTime = performance.now() + 2000;
            this.#isAnimationEnded = !this.#isAnimationEnded;
        }

        this.#OpenAnimation();
        
        if(cameraPosition != undefined && min != undefined && max != undefined)
        {
            var norm = (cameraPosition - min) / (max - min);

            this.#Safe.rotation.y = LerpFunc.smoothStepLerp(-50 * THREE.MathUtils.DEG2RAD, -135 * THREE.MathUtils.DEG2RAD, clamp(norm, 0, 1));
        }
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
        this.#Door.rotation.set(0, 0, 0);
        this.#DoorHandle.rotation.set(0, 0, 0);
        this.UnlockAnimation();
    }

    #OpenAnimation()
    {
        var normilizedTime;
        if(this.#animationStartTime < performance.now() && performance.now() < this.#animationStartTime + 2000)
        {
            normilizedTime = (performance.now() - this.#animationStartTime) / ((this.#animationStartTime + 2000) - this.#animationStartTime);
            this.#DoorHandle.rotation.set(this.#DoorHandle.rotation.x, this.#DoorHandle.rotation.y, LerpFunc.EaseOutLerp(0, 1080 * THREE.MathUtils.DEG2RAD, normilizedTime));
        }
        
        if((this.#animationStartTime + 2200) < performance.now() && performance.now() < (this.#animationStartTime + 5000))
        {
            normilizedTime = (performance.now() - (this.#animationStartTime + 2200)) / ((this.#animationStartTime + 5000) - (this.#animationStartTime + 2200));
            this.#Door.rotation.y = LerpFunc.EaseOutLerp(0, -125 * THREE.MathUtils.DEG2RAD, normilizedTime);
        }
    }
}