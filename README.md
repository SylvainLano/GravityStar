# Gravity Star

[Gravity Star](https://sylvainlano.github.io/GravityStar/) lets you throw massive asteroids at the Solar System, in 3D, right in your browser.
It was first created in ten days with React Three Fiber.

## How to play

- **Launch an asteroid**: press anywhere in the scene to create an asteroid under the pointer, drag to aim (an arrow shows the direction and strength), then release to throw it. It works with a mouse, a finger or a pen.
- **Launch mode**, in the settings:
  - *Free Throw* (default): asteroids are created facing the camera and get a small push towards the star.
  - *Orbital Plane*: asteroids are created in the plane where the planets orbit, and thrown exactly where you aim.
- **Speed**: the Speed setting slows the game down (1 is half speed), speeds it up (up to 10, five times faster) or pauses it (0). The space bar pauses and resumes the game. While it is paused, you can still create and aim asteroids: they all set off when the game resumes.
- **Settings**: hover the "Change the settings here" panel (or tap it on a touch screen) to change the size and luminosity of the star, the size of the planets, the mass of the asteroids and the strength of gravity. Changing the star's mass breaks the orbits.
- **Skins**: choose the look of the game with the round buttons in the top right corner, or with the ← and → keys. The choice is remembered, and shown in the link (e.g. `?skin=comic`) so that it can be shared.

## Skins

Skins change the look of the game, never its physics.

| Skin | Look |
| --- | --- |
| Realistic | Photo textures and physical lighting (default) |
| Comic | Comic book: vivid flat colors, ink outlines, violet shadows and pen hatching |
| Pastel | Soft washes on paper, cool shadows and pigment grain |
| Arcade | Big pixels, a limited palette, dithering and scanlines |
| Neko Nebula | Japanese shoot'em up madness: the planets become characters (a tabby cat, an octopus, a diva…) around a star in sunglasses |
| Anime | Hard shadows with a warm band, manga screentone and lens glare |

### Neko Nebula, a homage to Parodius

Neko Nebula is a homage to the [Parodius](https://en.wikipedia.org/wiki/Parodius) series by Konami, whose cheerful absurdity, flat bright colors and cast of cute characters inspired it.
All its characters are original creations: none is taken from the games. Parodius is a trademark of Konami, which has nothing to do with this project.

## Development

Built with React, React Three Fiber, three.js and Vite. It needs [Node.js](https://nodejs.org/).

```
npm install       # install the dependencies
npm run dev       # start the development server (http://localhost:5173/GravityStar/)
npm run lab       # start the development server and open the style lab
npm run build     # build the site into dist/
npm run preview   # serve the built site locally
npm run deploy    # build and publish to GitHub Pages
```

The **style lab** (`lab.html`) is a development tool to design and compare the skins: keys 1 to 6 switch between the styles, G between a close-up view and the view of the game, and it can light the planets from any angle. It is not part of the published site.

### Where things are

- `src/StarScene.jsx`: the scene, the planets' data and the launching of the asteroids
- `src/Planet.jsx`, `src/Asteroid.jsx`, `src/Star.jsx`, `src/physics.js`: the bodies and their gravity, computed with a fixed time step so that the game runs at the same speed whatever the frame rate
- `src/SimulationClock.jsx`: the clock of the simulation, which follows the Speed setting and cuts fast frames into small steps so that the bodies follow the same paths at any speed
- `src/skins/skins.js`: the list of skins, with their colors
- `src/skins/styleMaterials.js`: the shaders of the stylized skins; `looks.js` makes the materials of each element with them
- `src/skins/nekoNebula.js`, `src/skins/NekoNebulaCharacters.jsx`: the materials, pixel art faces and characters of Neko Nebula
- `src/skins/SkinContext.jsx`: gives the current skin to the scene, and creates the materials of a skin the first time it is chosen
- `src/lab/`: the style lab

## External Material

Planet textures from [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Asteroid model: "[Meteorite](https://sketchfab.com/3d-models/meteorite-0a503e5bec784cbc9082e2f6b2d9f701)" by [Hailphilly](https://sketchfab.com/hailphilly), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), simplified for the web.
