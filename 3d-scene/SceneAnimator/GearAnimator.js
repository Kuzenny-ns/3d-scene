import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {Animator} from './Animator.js'
import * as LerpFunc from '../utils/Lerp.js';

export class GearAnimator extends Animator 
{
    #GearsArray = [];
    #GearDict = {};

    #isLoaded = false;

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
        const result = await loader.loadAsync('3D_models/Gear/gear_scene2.gltf');

        let object3D = result.scene.getObjectByName('box_output');
        object3D.parent.remove(object3D);
		
		
		let list = [];

        result.scene.traverse( function( node ) {
			if(node instanceof THREE.Mesh)
			{
				list.push(node);
			}
        });

		list.forEach(element => {
			element.parent.remove(element);
			object3D.add(element);
			element.position.set(element.position.x - object3D.position.x, element.position.y - object3D.position.y, element.position.z - object3D.position.z);
			let rotationDirection = element.name.slice(-2);
			if(rotationDirection == "_r")
			{
				this.#GearDict[element.name] = 1;
			}
			else if(rotationDirection == "_l")
			{
				this.#GearDict[element.name] = -1;
			}
		});

		list.splice(list.findIndex(element => element.name == "box_input"), 1);

        if(bloomPass != undefined)
        {
            object3D.traverse( function( node ) {
				if(node instanceof THREE.Mesh)
				{
					bloomPass.selection.add(node);
				}
			});
        }
        this.#isLoaded = true;

        this.rootObject = object3D;
		this.#GearsArray = list;

        this.SetAllProperties();
    }

    UpdateLoop()
    {
        if(!this.#isLoaded)
        {
            return;
        }

        for (let i = 0; i < this.#GearsArray.length; i++)
        {
            this.#GearsArray[i].rotation.y += 1 * THREE.MathUtils.DEG2RAD * this.#GearDict[this.#GearsArray[i].name];
        }
    }
}