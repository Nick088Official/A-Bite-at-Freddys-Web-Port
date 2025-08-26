# A Bite at Freddy's - Web Port

This is an **Unofficial Web Port** of the free Godot horror game, [**A Bite at Freddy's by Garrett McKay**](https://garrett-mckay.itch.io/a-bite-at-freddys). This port allows the game to be played directly in a web browser without needing any downloads/installations.

## How to play

There are 2 methods:

### Vercel
Go to https://a-bite-at-freddys-web-port.vercel.app/godot/ABaF.html

### Local Server
1. Click Code -> Download ZIP -> Extract the Zip.
2. [Get Python](https://www.python.org/downloads/) installed and added to your system's PATH.
3. Open a CMD/Terminal **inside the root project folder** (I manually renamed the folder for a shorter url for github pages and to not confuse with the non-game files).
4. Run the following command to start a simple web server:
    ```bash
    python -m http.server
    ```
5. Open your web browser and go to the following address:
    **http://localhost:8000/godot/ABaF.html**


## How did you make it?

This guide provides step-by-step instructions for building a web version of the game.

### Prerequisites

1. **Get the Game Files:** [Download the original game from the creator's itch.io page](https://garrett-mckay.itch.io/a-bite-at-freddys) and extract the files.
2. **GDRETools/gdsdecomp:** [Download the Latest GDRETools/gdsdecomp](https://github.com/GDRETools/gdsdecomp/releases/latest) to Decompile the game.
3. **Godot**: Having [Godot](https://godotengine.org/download) installed, for this game, version [3.5-stable](https://github.com/godotengine/godot-builds/releases/tag/3.5-stable) specifically.
4. **Python (for running):** Having [Python](https://www.python.org/downloads/) installed and added to your system's PATH, to run the local web server.
5. **Git LFS (Optional, for uploading on GitHub):** [Git Large File Storage](https://git-lfs.github.com/) installed on your system. This is crucial for handling large game files in Git.


### Part A: Decompiling

We need to Decompile the game to get the Source Code from the `.exe`, to use to Build the Web Version.

1. Open GDRETools/gdsdecomp -> RE Tools -> Recover project -> Select the Game Executable -> Extract it somewhere.

### Part B: Godot Build Web Version

1. Import the Decompiled Game in [Godot 3.5-stable](https://github.com/godotengine/godot-builds/releases/tag/3.5-stable).
2. Editor > Manage Export Templates -> Download & Install.
3. In Project -> Project Settings -> Rendering -> VRAM Texture Compression -> Enable "Import ETC". You will get a warning that "The editor must be restarted for changes to take effect", click Save & Restart next to it.
4. Project -> Export -> Add -> Web.
5. In Options, in VRAM Texture Compression, Check For Mobile.
6. Export Project to a dedicated, empty subfolder of your root project, name it like `godot` used in this repository for convenience. This subfolder will contain `index.html`, `.js`, `.pck`, `.wasm`, etc.

### Part C: Running the Game Locally

You need to run them using a local web server. Simply opening the `.html` file directly will not work due to browser security restrictions.

1. Open a CMD/Terminal **inside the root project folder**.
3. Run the following command to start a web server:
    ```bash
    python -m http.server
    ```
4. Open your web browser and go to the following address:
    **http://localhost:8000/godot/ABaF.html**

The game should now start and be fully playable.

### Part D: Git Repository Setup (with Git LFS) (Optional)

For uploading the repository to GitHub, it's essential to use Git Large File Storage (Git LFS) for the large game files.

1. Initialize Git & Git LFS to the root of your project where your `godot` project folder folder resides via running:
    ```bash
    git init
    git lfs install
    ```
2. Tell Git LFS to track your Godot game's package and WebAssembly files. Use:
    ```bash
    git lfs track "godot/*.pck"
    git lfs track "godot/*.wasm"
    ```
    This creates/updates the `.gitattributes` file.
3. Add and Commit All Files via:
    ```bash
    git add .
    git commit -m "Add Godot web export, Git LFS tracking"
    ```
4. Create a new repository on GitHub and push your local changes. Verify on GitHub that `.pck` and `.wasm` files show "Stored with Git LFS".
    
### Part E: Deploying to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click "Add New..." > "Project".
3. Select "Import Git Repository" and choose the GitHub repository you set up in Part C.
4. Once the project is created, go to its "Settings" tab, go to Git -> Git Large File Storage (LFS) and ensure it is enabled. This is critical for Vercel to download your large `.pck` and `.wasm` files.
5. Save your Vercel project settings. This will automatically trigger a new deployment. If not, go to the "Deployments" tab and manually click "Redeploy".
6. Open the Vercel deployment URL in your browser. The game should load past the initial loading bar. Check your browser's Developer Tools (F12) Console for errors and Network tab for correct HTTP headers.


## Why is it hosted on Vercel and not GitHub Pages?

Because GitHub Pages does not support Git LFS used for the large ``.pck`` and ``.wasm`` files.


## Why did you make it?

For pure educational purposes, fun, and to make this game accessible on more platforms.


## Credits

- **Game:** All credit for the game's creation goes to **Garrett McKay**. Please support the original creator by visiting the [official itch.io page](https://garrett-mckay.itch.io/a-bite-at-freddys).
- **Web Port:** This web-based version was ported by [Nick088](https://linktr.ee/nick088).
- **Game Engine:** [Godot](https://godotengine.org/), specifically used version [3.5-stable](https://github.com/godotengine/godot-builds/releases/tag/3.5-stable) for this game.