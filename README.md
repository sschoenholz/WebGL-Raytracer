WebGL-Raytracer
===============

Raytracing is an appealing method of rendering scenes in three dimensions by tracing rays of light through the lens of a fictitious camera. Historically, raytracing has always been more expensive than rasterization for displaying scenes of similar complexity. However, recent advances in programmable GPUs coupled with the trivial parallelization of simple ray-tracers over different rays has caused a resurgence of interest in raytracing for real time rendering.

I wanted to try my hand at writing a real time raytracer using WebGL and javascript. The main challenge that I ran into was the fact that, while GPU programming has come a long way, the variant of C implemented in WebGL on the fragment shader does not support recursion. This mean that in order to get reflections working properly I had to unwrap the recursion. In order to get the scene information onto the GPU I packed the scene data into several different small textures. This was an artifact of using WebGL. If I had chosen to use CUDA or a more current version of OpenGL this would not have been necessary.

To use the raytracer, create a new raytracer object and then populate it with some scene objects.
```
//Initialize the ray tracer
raytracer = new Raytracer(glCanvas);
raytracer.build();
				
//Add geometry to the scene
raytracer.objects.push(new Sphere());
raytracer.objects[0].position = [0.0,1.01,0.0,1.0]; //note that the fourth component of the position is the radius
raytracer.objects[0].material = [0.2,1.0,0.2,0.75]; //The first three components are color, the fourth is the diffuse lighting component
raytracer.objects[0].materialExtended = [0.3,0.6,0.0,0.0]; //the first component is specular lighting, the second component is reflection coefficient, and the rest are currently unused.

//build the scene
raytracer.buildObjects();
raytracer.buildLights();
```
Then in the render loop simply call
```
raytracer.draw();
```
If you move any objects in realtime raytracer.buildObjects() must be called to update the scene on the GPU.

Here is a gif of the raytracer in action,

![](https://samschoenholz.files.wordpress.com/2015/10/raytracer.gif)
