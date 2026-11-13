# Kilonaut 🚀
### Interactive Bilingual Space Science Mission Control Deck & Hands-On Learning Labs
*Designed for curious explorers ages 7–12, educators, parents, and NASA Space Apps Challenge evaluators.*

---

## 🌟 Overview

**Kilonaut** (كيلونوت) is a comprehensive, bilingual (Arabic & English) web experience that transforms young learners into certified junior astronauts. Explorers journey through three expansive cosmic sectors, progressive stages, planetary expeditions, hands-on scientific simulations, real game challenges, and child-safe AI communications with **Cosmo**, the academy's energetic 13-year-old space companion.

**Zero account or sign-in walls required** — everything persists securely in the cadet's browser local storage.
**Zero external npm dependencies required** — built purely on standard Node.js and web technologies.

---

## ⚡ Quick Start: How to Run

### Option 1: Double-Click the Launcher (Easiest)
Simply double-click `start-server.bat` or `run.bat` in this folder.

### Option 2: Windows PowerShell
If you are running in PowerShell, use:
```powershell
.\start-server.bat
```
or
```powershell
node server.js
```
*(Note: In PowerShell, scripts in the current directory require the `.\` prefix, e.g. `.\start-server.bat`)*

### Option 3: Command Prompt (cmd)
```cmd
start-server.bat
```
or
```cmd
node server.js
```

Once started, open your browser at:
```
http://127.0.0.1:3000
```

> **Note on Dependencies:** No `npm install` is required! The entire Kilonaut mission deck and backend are built using native Node.js and browser web APIs.

---

## 🎯 Key Features & Game Mechanics

### 1. Bilingual Mission-Control Deck & Cadet Profile
- **Instant AR/EN Language Switching**: Real-time bidirectional support with full RTL/LTR layout transitions, typography (`Cairo` for Arabic, `Outfit` for English, `JetBrains Mono` for telemetry), and child-friendly terminology. Switching languages **preserves in-progress challenge state** without restarting.
- **Cadet Onboarding**: Greeted by Cosmo with an audio chime and spoken welcome. Choose your call-sign and select your mission avatar (**Lunar Rover**, **Astro Bear**, **Rocket Cat**, or **Star Explorer**).
- **Friendly Voice Companion**: Cosmo's voice is custom-tuned to sound like a friendly, energetic ~13-year-old companion (pitch 1.25, rate 1.05) rather than robotic or artificial.

### 2. Sector 1: Solar System Odyssey (رحلة المجموعة الشمسية)
- **Stage 1 (S1_1) — Complete 8-Planet Solar Orrery**:
  - *Simulation*: All 8 planets (Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune) with accurate relative speeds and detailed surface rendering (craters, clouds, oceans, Great Red Spot, 3D tilted rings).
  - *Challenge*: Order all 8 planets by their distance from the Sun with up/down swap controls and intelligent guidance.
- **Stage 2 (S1_2) — Asteroid Belt Navigation**:
  - *Simulation*: Dynamic asteroid particle field with Ceres highlight.
  - *Challenge*: Steer a NASA probe through asteroid lanes using **either mouse/touch drag** or on-screen buttons / arrow keys.
- **Stage 3 (S1_3) — 7 Planet Expeditions (35 Interactive Missions)**:
  - *Structure*: 7 unique planetary expeditions (Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune), each featuring 5 hands-on interactive mini-games/challenges (Atmospheric probes, surface landers, cloud samplers, magnetic shield tests, and storm trackers).

### 3. Sector 2: Black Holes & Cosmic Mysteries (أسرار الثقوب السوداء والأقمار)
- **Stage 1 (S2_1) — Ocean Moons of Deep Space**:
  - *Simulation*: Detailed models of Earth's Moon, Europa, Ganymede, Io, Titan, and Enceladus with cryovolcanic plumes, sulfur vents, and lineae.
  - *Challenge*: Match each moon to its parent planet. If more than 2 mistakes are made, a single moon is returned to the unassigned pool as a fair penalty.
- **Stage 2 (S2_2) — Gravity Wells & Relativistic Slingshot**:
  - *Simulation*: 3D warped spacetime grid, Doppler accretion disk, and photon sphere.
  - *Challenge*: Gravitational slingshot orbital launcher with angle & thruster controls.
- **Stage 3 (S2_3) — James Webb Optical Beam Alignment**:
  - *Challenge*: Overhauled from simple clicks into a true optical wavefront alignment challenge. Cadets tune 6 primary mirror lasers to converge into the central focal collector within precise tolerance.

### 4. Sector 3: Galactic Frontiers (حدود المجرات والكون)
- **Stage 1 (S3_1) — Milky Way Galactic Radar Triangulation**:
  - *Simulation*: Dynamic spiral galaxy where the "YOU ARE HERE" Sun/Orion Arm marker actively orbits the galactic core.
  - *Challenge*: Overhauled into a galactic radar triangulation scanner with azimuth sweeps, frequency tuner, and lock-on telemetry.
- **Stage 2 (S3_2) — Stellar Life Cycle Sequencer**:
  - *Simulation & Challenge*: Sequence stellar evolution branches (Sun-like and massive stars) with state preservation during language changes.
- **Stage 3 (S3_3) — Goldilocks Zone & Culminating Commander Exam**:
  - *Challenge*: Test orbital distances around TRAPPIST-1. Real-time hints are hidden; cadets only discover thermal conditions (too hot, too cold, or temperate liquid water) when launching the climate probe.
  - *Commander Exam*: Clean planet options without giveaway hints, randomized answer placement, detailed explanations for why wrong/right answers are scientifically correct, and a manual **Next Question ➔** button so kids can read at their own pace.
  - *Automatic Stage Transitions*: Finishing any stage unlocks the next stage and smoothly transitions the cadet forward.

### 5. Dedicated Section: Astronaut Training Facility (مركز تدريب رواد الفضاء)
- A dedicated, separate training section distinct from the three deep-space exploration sectors, focusing on human spaceflight conditioning, orbital mechanics, and space station operations:
  1. **Experiencing Weightlessness & Law of Inertia**: Physics-accurate zero-friction microgravity simulation demonstrating Newton's First Law (an object once pushed continues moving with constant velocity indefinitely). Cadets flick/push floating tools and guide them into magnetic restow bays.
  2. **Preparing a Spacesuit (EMU Deck)**: Hands-on assembly of all 6 NASA spacesuit layers (LCVG, LTA, HUT, PLSS, Gold Helmet Visor, Gloves/Tether), 100% Oxygen Nitrogen Washout pre-breathe, and 4.3 PSI leak verification.
  3. **Simulating a Day on the Space Station**: 3-phase 24-hour ISS day simulator covering zero-g sleeping (tethered bags with active ventilation airflow to avoid CO₂ pooling), mandatory countermeasure workouts (T2 treadmill bungee harness & ARED resistance reps), and space gastronomy (meal rehydration pouches, crumb-free wheat tortillas, catching floating juice droplets).
  4. **Station Emergency Flight Decisions**: High-stakes crisis management solving 4 real NASA orbital emergencies (cabin depressurization, toxic ammonia leak, avionics electrical fire, and orbital space debris conjunction) based on official Flight Rules.
  5. **Crew Teamwork & Coordination**: Multi-crew collaborative operations with Commander, Flight Engineer, Science Lead, and Houston Capcom (Read-and-Do verbal verification, dual-key synchronized bus switches, and spacewalk voice relays).
  6. **Robotic Arm Cargo Docking Maneuver**: Precision Canadarm2 grapple simulator reusing the fluid mouse/touch tracking control architecture from the asteroid stage to capture visiting cargo spacecraft (Cygnus/Dragon) and berth them to the station port.

### 6. Cosmo's Child-Safe Space Radio Communications
- Connects to `/api/cosmo/ask` route. When `GEMINI_API_KEY` is provided, queries Google Gemini with child-safe space-only prompts (strict 80-word limit, vivid space analogies).
- 100% offline fallback with curated bilingual space knowledge.
- Spoken responses in Arabic or English with tuned youthful pitch.

### 7. Local Flight Log, Achievement Passport & Graduation
- 9 collectible golden astronomy mission patches + 6 certified astronaut training badges.
- Rank progression: **Cadet** ➔ **Pilot** ➔ **Specialist** ➔ **Commander**.
- Shareable badges and personalized printable **Junior Astronaut Certificate**.

---

## 📂 Project Architecture

```
nasa-junior-astronaut/
├── package.json               # Project manifest (Kilonaut)
├── server.js                  # Node server (static server + /api/cosmo/ask route)
├── start-server.bat           # Quick launcher script (double-click friendly)
├── run.bat                    # Alternate quick launcher
├── README.md                  # Documentation
└── public/
    ├── index.html             # Master Mission Control Deck
    ├── css/
    │   └── styles.css         # Cosmic visual design & print stylesheet
    └── js/
        ├── audio.js           # Web Audio API procedural sound engine
        ├── speech.js          # Web Speech API (youth voice tuning)
        ├── state.js           # LocalStorage state, rank progression & training tracker
        ├── i18n.js            # Arabic & English translation dictionary
        ├── curated-cosmo.js   # Offline curated bilingual space knowledge
        ├── sectors.js         # 3 Cosmic Sectors, 9 Stages & Badges definitions
        ├── simulations.js     # Canvas & SVG simulations (8 planets, moving Sun, detailed moons)
        ├── challenges.js      # 9 Challenge arenas (7 planet expeditions, mouse probe, radar, JWST)
        ├── astronaut-training.js # Dedicated Astronaut Training Facility (6 Interactive Labs)
        ├── cosmo-comms.js     # Cosmo Space Radio controller
        ├── passport.js        # Flight log, sharing & printable certificate
        └── app.js             # Bootstrap & automatic stage transition coordinator
```
        ├── state.js           # LocalStorage state & rank progression
        ├── i18n.js            # Arabic & English translation dictionary
        ├── curated-cosmo.js   # Offline curated bilingual science answers
        ├── sectors.js         # 3 Sectors, 9 Stages & Badges definitions
        ├── simulations.js     # Canvas & SVG simulations (8 planets, moving Sun, detailed moons)
        ├── challenges.js      # 9 Challenge arenas (7 planet expeditions, mouse probe, radar, JWST)
        ├── cosmo-comms.js     # Cosmo Space Radio controller
        ├── passport.js        # Flight log, sharing & printable certificate
        └── app.js             # Bootstrap & automatic stage transition coordinator
```
