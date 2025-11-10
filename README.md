# eMuseum Proof of Concept

Just a quick demo of how one might create an eMuseum.

## Requirements

Mac with Node.js and npm installed
You can install Node.js (which includes npm) from https://nodejs.org/

## Controls

- Mouse drag → orbit around the room
- Mouse scroll → zoom in/out
- Hover over objects → highlights them
- Click on objects → show popup with information

## How to run locally

### Open Terminal

Press Command + Space, type Terminal, and press Enter.

### Navigate to the project folder

For example, if the project is in your Downloads folder:

```bash
cd ~/Downloads/emuseum-poc
```

### Install dependencies

This only needs to be done once:

```bash
npm install
```

### Start the local development server

```bash
npm run dev
```

### Open the app in your browser

After running the command, Terminal will show a URL like:

```bash
Local:   http://localhost:5173
Network: use --host to expose
```

Open that URL in your browser to see the 3D room.
