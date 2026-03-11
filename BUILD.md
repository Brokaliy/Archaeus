# Building Archaeus

## Requirements
- Arch Linux host (or VM)
- `archiso` package: `sudo pacman -S archiso`

## Build the ISO

```bash
cd /path/to/archaeus

# Copy ACC into the airootfs
sudo cp -r acc/ archiso/airootfs/opt/archaeus/

# Build
sudo mkarchiso -v -w /tmp/archaeus-work -o /tmp/archaeus-out ./archiso/

# ISO will be at /tmp/archaeus-out/archaeus-*.iso
```

## Test in VM (VirtualBox)

1. Create new VM: Linux → Arch Linux (64-bit)
2. 4GB+ RAM, 20GB+ disk
3. Mount the ISO as optical drive
4. Boot — you'll land at a live SDDM session
5. Open terminal and run `archaeus-install` to set up

## Install to real machine

Boot from USB, then:
```bash
# Partition your disk (use cfdisk or fdisk)
# Then run the installer
archaeus-install
```

## Dev: Run ACC standalone

```bash
cd acc
npm install
npm start
```

## File structure

```
archaeus/
├── archiso/              # archiso profile (builds the ISO)
│   ├── profiledef.sh
│   ├── packages.x86_64
│   ├── pacman.conf
│   └── airootfs/         # overlaid onto the live system
│       ├── etc/
│       │   ├── skel/     # default user configs
│       │   └── sddm.conf.d/
│       └── usr/
│           ├── local/bin/  # acc-launcher, archaeus-install
│           └── share/sddm/themes/archaeus/
└── acc/                  # Archaeus Control Center (Electron)
    ├── package.json
    └── src/
        ├── main.js       # Electron main process
        ├── preload.js    # IPC bridge
        └── renderer/     # UI
            ├── index.html
            ├── style.css
            ├── app.js
            └── tabs/
                ├── packages.js
                ├── desktop.js
                ├── appearance.js
                ├── startup.js
                └── keybinds.js
```
