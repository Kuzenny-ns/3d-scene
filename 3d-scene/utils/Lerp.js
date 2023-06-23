export function EaseOutLerp(p0, p1, value)
{
    var t = value * value;
    return (1 - t) * p0 + t * p1;
}

export function EaseInLerp(p0, p1, value)
{
    var t = 1 - (1 - value) * (1 - value);
    return (1 - t) * p0 + t * p1;
}

export function lerp(p0, p1, value)
{
  return (1 - value) * p0 + value * p1;
}

export function smoothStepLerp(p0, p1, value)
{
    var v1 = value * value;
    var v2 = 1 - (1 - value) * (1 - value);
    var t = lerp(v1, v2, value)
    return (1 - t) * p0 + t * p1;
}