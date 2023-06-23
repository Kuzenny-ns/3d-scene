//import './style.css'

import * as THREE from 'three'
//import { MeshLine, MeshLineMaterial} from 'three.meshline';

function lerp(p0, p1, value)
{
	return ( 1 - value) * p0 + value * p1;
}

function smoothStepLerp(p0, p1, value)
{
	var v1 = value * value;
	var v2 = 1 - (1 - value) * (1 - value);
	var t = lerp(v1, v2, value)
	return ( 1 - t) * p0 + t * p1;
}

function clamp(value, min, max)
{
	return Math.min(Math.max(value, min), max);
}

export class CameraAnimator
{
	#cameraToAnimate;
	#keyFrameArray = [];
	#currentKeyFrame = 0;
	#currentTimeStamp = 0;

	#curentFrameStartTime

	positionValue = 0;
	constructor(camera, timeStamp)
	{
		if(camera == undefined)
		{
			throw new Error("Camera argument must be passed.");
		}
		else
		{
			this.#cameraToAnimate = camera;
		}

		if(timeStamp == undefined)
		{
			this.#currentTimeStamp = 0;
		}
		else
		{
			this.#currentTimeStamp = timeStamp;
		}
		this.#curentFrameStartTime = performance.now();
		this.positionValue = 0;
	}

	AddKeyFrames(...KeyFrames)
	{
		for(let KeyFrame of KeyFrames)
		{
			this.#keyFrameArray.push(KeyFrame);
		}
		if(this.#keyFrameArray.length > 1)
		{
			let buff;
			for (let i = 0; i < this.#keyFrameArray.length - 1; i++)
			{
				for (let j = this.#keyFrameArray.length - 1; j > i; j--)
				{
					if (this.#keyFrameArray[j].GetTimeStamp() < this.#keyFrameArray[j - 1].GetTimeStamp())
					{
						buff = this.#keyFrameArray[j - 1].GetTimeStamp();
						this.#keyFrameArray[j - 1].SetTimeStamp(this.#keyFrameArray[j].GetTimeStamp());
						this.#keyFrameArray[j].SetTimeStamp(buff);
					}
				}   
			}
		}
		//console.log(this.#keyFrameArray);
	}

	#Lerp(k0, k1, value)
	{
		let result = new THREE.Vector3();
		result.x = ( 1 - value) * k0.x + value * k1.x;
		result.y = ( 1 - value) * k0.y + value * k1.y;
		result.z = ( 1 - value) * k0.z + value * k1.z;
		return result;

		//return ( 1 - value) * p0 + value * p1;
	}

	UpdateAnimation(newTimeStamp)
	{
		var normTime = (performance.now() / 1000 - this.#curentFrameStartTime) / ((this.#curentFrameStartTime + 5) - this.#curentFrameStartTime);
		if(this.#currentKeyFrame == this.#keyFrameArray.length - 1)
		{
			return;
		}
		this.NextKeyFrame();
		this.PrevKeyFrame();
		
		newTimeStamp = clamp(newTimeStamp, this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp() - 50, this.#keyFrameArray[this.#currentKeyFrame + 1].GetTimeStamp() + 50);

		this.#currentTimeStamp = smoothStepLerp(this.#currentTimeStamp, newTimeStamp, this.#keyFrameArray[this.#currentKeyFrame].GetTransitionSpeed());

		if(newTimeStamp > this.#currentTimeStamp && newTimeStamp != this.#currentTimeStamp)
		{
			this.positionValue += 0.01;
		}
		else if(newTimeStamp != this.#currentTimeStamp)
		{
			this.positionValue -= 0.01;
		}

		let normolizedTimeStamp = Math.min(Math.max(this.#NormolizeTimeStamp(), 0), 1);
		let newPosition;
		let newRotation

		switch (this.#keyFrameArray[this.#currentKeyFrame].GetTransition()) {
			case 0: //Smooth
				{
					newPosition = this.#Lerp(this.#keyFrameArray[this.#currentKeyFrame].GetPosition(), this.#keyFrameArray[this.#currentKeyFrame + 1].GetPosition(), normolizedTimeStamp);
					newRotation = this.#Lerp(this.#keyFrameArray[this.#currentKeyFrame].GetRotation(), this.#keyFrameArray[this.#currentKeyFrame + 1].GetRotation(), normolizedTimeStamp);
				}
				break;
			case 1: //Direct
				{
					newPosition = this.#keyFrameArray[this.#currentKeyFrame + 1].GetPosition();
					newRotation = this.#keyFrameArray[this.#currentKeyFrame + 1].GetRotation();
				}
				break;
		
			default:
				break;
		}
		this.#cameraToAnimate.position.set(newPosition.x, newPosition.y, newPosition.z);
		this.#cameraToAnimate.lookAt(newRotation);
		return normolizedTimeStamp;
	}

	NextKeyFrame()
	{
		if(this.#currentKeyFrame + 1 < this.#keyFrameArray.length)
		{
			if(this.#keyFrameArray[this.#currentKeyFrame + 1].GetTimeStamp() < this.#currentTimeStamp)
			{
				this.#keyFrameArray[this.#currentKeyFrame].HideElement();
				this.#currentKeyFrame++;
				this.#keyFrameArray[this.#currentKeyFrame].ShowElement();
				this.positionValue = 0;
			}
		}
	}

	PrevKeyFrame()
	{
		if(this.#currentKeyFrame - 1 >= 0)
		{
			if(this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp() > this.#currentTimeStamp)
			{
				this.#keyFrameArray[this.#currentKeyFrame].HideElement();
				this.#currentKeyFrame--;
				this.#keyFrameArray[this.#currentKeyFrame].ShowElement();
				this.positionValue = 1;
			}
		}
	}

	#NormolizeTimeStamp()
	{
		return (this.#currentTimeStamp - this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp()) / (this.#keyFrameArray[this.#currentKeyFrame + 1].GetTimeStamp() - this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp());
	}

	#NormolizeTime(time)
	{
		return (time - this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp()) / (this.#keyFrameArray[this.#currentKeyFrame + 1].GetTimeStamp() - this.#keyFrameArray[this.#currentKeyFrame].GetTimeStamp());
	}

	GetTimeStamp()
	{
		return this.#currentTimeStamp;
	}
}

export class KeyFrame
{
    #actorPosition;
    #actorRotation;
    #actorScale;

    #timeStamp = 0;

    #transitionType = 0; //0 - Smooth, 1 - Direct
    #transitionSpeed;

    #elementToShow = [];

    constructor(position, rotation, scale, time, type, speed, ...elementToShow)
    {
        if(position == undefined)
        {
            this.#actorPosition = new THREE.Vector3(0, 0, 0);
        }
        else
        {
            this.#actorPosition = position;
        }

        if(rotation == undefined)
        {
            this.#actorRotation = new THREE.Vector3(0, 0, 0);
        }
        else
        {
            this.#actorRotation = rotation;
        }

        if(scale == undefined)
        {
            this.#actorScale = new THREE.Vector3(1, 1, 1);
        }
        else
        {
            this.#actorScale = scale;
        }

        if(time == undefined)
        {
            this.#timeStamp = 0;
        }
        else
        {
            this.#timeStamp = time;
        }

        if(type == undefined)
        {
            this.#transitionType = 0;
        }
        else if(type >= 0 && type <= 1)
        {
            this.#transitionType = type;
        }

        if(speed == undefined)
        {
            this.#transitionSpeed = 0.1;
        }
        else
        {
            this.#transitionSpeed = speed;
        }
        //this.#elementToShow = elementToShow;
        for(let element of elementToShow)
        {
            this.#elementToShow.push(element);
        }
    }

    ShowElement()
    {
        if(this.#elementToShow.length <= 0)
        {
            return;
        }
        for(let element of this.#elementToShow)
        {
            element.style.visibility = 'visible';
            element.classList.add("animatedFI");
            setTimeout(() => {
                element.classList.remove("animatedFI");
            }, 500);
        }
    }

    HideElement()
    {
        if(this.#elementToShow.length <= 0)
        {
            return;
        }
        for(let element of this.#elementToShow)
        {
            element.style.visibility = 'visible';
            element.classList.add("animatedFO");
            setTimeout(() => {
                element.style.visibility = 'hidden';
                element.classList.remove("animatedFO");
            }, 400);
        }
    }
    
    SetTransition(type)
    {
        if(type >= 0 && type <= 1)
        {
            this.#transitionType = type;
        }
    }

    GetTransition()
    {
        return this.#transitionType;
    }

    GetTransitionSpeed()
    {
        return this.#transitionSpeed;
    }

    SetTimeStamp(timeToSet)
    {
        this.#timeStamp = timeToSet;
    }

    GetTimeStamp()
    {
        return this.#timeStamp;
    }

    GetPosition()
    {
        return this.#actorPosition;
    }

    GetRotation()
    {
        return this.#actorRotation;
    }
}