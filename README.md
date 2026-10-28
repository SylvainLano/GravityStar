# Gravity Star

[Gravity Star](https://sylvainlano.github.io/GravityStar/) lets you throw massive asteroids at the Solar System, in 3D, right in your browser.
It was first created in ten days with React Three Fiber.

## How to play

Each game starts with the planets at random places on their orbits (the farthest ones behind the star, where they can be seen).
The "New random system" button of the settings, or the R key, starts again with a new random system, keeping the settings.

- **Launch an asteroid**: press anywhere in the scene to create an asteroid under the pointer, drag to aim (an arrow shows the direction and strength), then release to throw it. It works with a mouse, a finger or a pen.
  While aiming, dots show the path the asteroid will follow, bent by the gravity of the star and the planets; a bigger dot marks where it would hit one of them. The prediction follows the rules of the game, but leaves out the pull of the planets on each other and the other asteroids. The Trajectory Preview setting, or the T key, hides it for those who prefer to aim by feel.
- **Launch mode**, in the settings:
  - *Free Throw* (default): asteroids are created facing the camera and get a small push towards the star.
  - *Orbital Plane*: asteroids are created in the plane where the planets orbit, and thrown exactly where you aim.
- **Trails**: the Asteroid Trail and Planet Trail settings draw the path of the bodies behind them, in the style of the skin. 0 draws none; from 1 to 10, each step doubles their length, from 1 second to about 8 and a half minutes of the game (asteroids: 3 by default; planets: none by default).
- **Sound**: off when the game starts; the speaker button next to the skins, or the M key, switches it on. Its volume is set with the slider that unrolls when hovering the speaker button, or with the Volume setting: they show 0 while the sound is off, sliding them up switches it on, and down to 0 cuts it. Switching it on brings back the volume it had before being cut, remembered for the next visits (7 the first time, or after sliding it down to 0). Nothing can be heard in space, so the Realistic skin turns the motion into music instead (a "music of the spheres"): each planet holds a note drawn from its orbit (Mercury the highest, Neptune the lowest), louder as it comes closer and ringing when it passes in front of the star; a moving asteroid whistles higher as it goes faster, and an impact makes the system rumble. The stylized skins, which make no claim to realism, have sound effects in their own style.
- **Interface**: the H key hides it (settings, skins, credits), to look at the scene or take a picture of it, and shows it again. The F key puts the game in full screen without it; F again or Esc leaves the full screen and brings it back.
- **Zoom**: the mouse wheel (or a pinch on a touchpad) and the + and - keys bring the camera closer to the star or farther from it.
- **Speed**: the Speed setting slows the game down (1 is half speed), speeds it up (up to 10, five times faster) or pauses it (0). The space bar pauses and resumes the game. While it is paused, you can still create and aim asteroids: they all set off when the game resumes.
- **Settings**: hover the "Change the settings here" panel (or tap it on a touch screen) to change the size and luminosity of the star, the size of the planets, the mass of the asteroids and the strength of gravity. Changing the star's mass breaks the orbits.
- **Skins**: choose the look of the game with the round buttons in the top right corner, or with the ← and → keys. The choice is remembered, and shown in the link (e.g. `?skin=comic`) so that it can be shared.

## Skins

Skins change the look of the game, never its physics. Each one also has its own explosions and its own colors for the settings.

| Skin | Look | Explosions |
| --- | --- | --- |
| Realistic | Photo textures and physical lighting (default) | Glowing debris |
| Neko Nebula | Japanese shoot'em up madness: the planets become characters (a tabby cat, an octopus, a diva…) around a star in sunglasses | Stars and hearts |
| Anime | Hard shadows with a warm band, manga screentone and lens glare | Impact flash with speed lines |
| Comic | Comic book: vivid flat colors, ink outlines, violet shadows and pen hatching | Onomatopoeias: BOOM!, KRAK!, POW!… |
| Arcade | Big pixels, a limited palette, dithering and scanlines | Blinking pixel sparks |
| Pastel | Chalk strokes on grey-blue pastel paper, cool hatched shadows and warm touches of light | Smudges of chalk |
| Watercolor | Transparent washes on white paper: highlights left white, a cool glaze for the shadows, darker edges, granulation and blooms | Splashes and drops of paint |

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

The **style lab** (`lab.html`) is a development tool to design and compare the skins: keys 1 to 7 switch between the styles, G between a close-up view and the view of the game, and it can light the planets from any angle. It is not part of the published site.

### Where things are

- `src/StarScene.jsx`: the scene, the planets' data and the launching of the asteroids
- `src/Planet.jsx`, `src/Asteroid.jsx`, `src/Star.jsx`, `src/physics.js`: the bodies and their gravity, computed with a fixed time step so that the game runs at the same speed whatever the frame rate
- `src/Trail.jsx`: the trails of the bodies, with a drawing style for each skin
- `src/audio/sound.js`: the sounds, made by the browser (Web Audio): the music of the spheres and the sound effects of each skin
- `src/TrajectoryPreview.jsx`: the path shown while aiming, predicted by `predictTrajectory` in `src/physics.js`
- `src/SimulationClock.jsx`: the clock of the simulation, which follows the Speed setting and cuts fast frames into small steps so that the bodies follow the same paths at any speed
- `src/skins/skins.js`: the list of skins, with their colors
- `src/skins/styleMaterials.js`: the shaders of the stylized skins; `looks.js` makes the materials of each element with them
- `src/skins/nekoNebula.js`, `src/skins/NekoNebulaCharacters.jsx`: the materials, pixel art faces and characters of Neko Nebula
- `src/skins/ExplosionEffects.jsx`: the explosions of the stylized skins; their interface colors are in `src/styles.css`
- `src/skins/SkinContext.jsx`: gives the current skin to the scene, and creates the materials of a skin the first time it is chosen
- `src/lab/`: the style lab

## External Material

Planet textures from [Solar System Scope](https://www.solarsystemscope.com/textures/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Asteroid model: "[Meteorite](https://sketchfab.com/3d-models/meteorite-0a503e5bec784cbc9082e2f6b2d9f701)" by [Hailphilly](https://sketchfab.com/hailphilly), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), simplified for the web.
