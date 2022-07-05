
type Polarity = 1 | -1
type directionMap = Map<string,IAnimValues>

interface ISlideParams {
    direction?: "up"|"down"|"left"|"right"
    duration?: number
    easing?: (t:number)=>number
    delay?:number
}

interface ISlideInternalParams extends ISlideParams {
    out: boolean
}

interface IAnimValues{
    translation: "translateX" | "translateY", 
    distance: number, 
    d_polarity: Polarity
}


function slideReplace(node: HTMLElement, {direction = "left", out=false, duration=350, easing, delay=0}: ISlideInternalParams): SvelteAnimationReturnType {

    let y = {translation:"translateY", distance: node.offsetHeight} 
    let x = {translation:"translateX", distance: node.offsetWidth}

    let directionMapper = new Map([
        ["up", {...y, d_polarity: 1} ],
        ["down", {...y, d_polarity: -1} ],
        ["left", {...x, d_polarity: -1} ],
        ["right", {...x, d_polarity: 1} ],
    ]) as directionMap;

    let {translation, distance, d_polarity} = directionMapper.get(direction);
    const t_polarity : Polarity = (out) ? 1 : -1;
    distance = distance * d_polarity; 

        return {
            delay,
            duration,
            easing,
            css: (t) => {
                let displacement = (t*distance)-distance;
                return `transform:${translation}(${t_polarity * displacement}px);`
            }
        }
}

export const slideReplaceIn = (node: HTMLElement, args: ISlideParams) => slideReplace(node, {...args, out:false})
export const slideReplaceOut = (node: HTMLElement, args: ISlideParams) => slideReplace(node, {...args, out:true})


