#!/bin/bash
# Archaeus OS — One-command build script
# Run this on an Arch Linux machine or in WSL2 with Arch.
# Output: archaeus-YYYY.MM.DD.iso

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORK_DIR="/tmp/archaeus-work"
OUT_DIR="$SCRIPT_DIR/dist"

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║        Archaeus OS — Build Script        ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# ── Check deps ───────────────────────────────────────────────────────────────

if ! command -v mkarchiso &>/dev/null; then
    echo "==> Installing archiso..."
    sudo pacman -Sy --noconfirm archiso
fi

if ! command -v node &>/dev/null; then
    echo "==> Installing nodejs..."
    sudo pacman -Sy --noconfirm nodejs npm
fi

# ── Build ACC ────────────────────────────────────────────────────────────────

echo "==> Building Archaeus Control Center..."
cd "$SCRIPT_DIR/acc"
npm install --prefer-offline 2>/dev/null || npm install
cd "$SCRIPT_DIR"

# ── Copy ACC into airootfs ────────────────────────────────────────────────────

echo "==> Copying ACC into airootfs..."
rm -rf "$SCRIPT_DIR/archiso/airootfs/opt/archaeus/acc"
mkdir -p "$SCRIPT_DIR/archiso/airootfs/opt/archaeus"
cp -r "$SCRIPT_DIR/acc" "$SCRIPT_DIR/archiso/airootfs/opt/archaeus/acc"
# Remove dev deps to keep ISO lean
rm -rf "$SCRIPT_DIR/archiso/airootfs/opt/archaeus/acc/node_modules/.cache"

# ── Clean previous work dir ───────────────────────────────────────────────────

if [[ -d "$WORK_DIR" ]]; then
    echo "==> Cleaning previous build..."
    sudo rm -rf "$WORK_DIR"
fi

mkdir -p "$OUT_DIR"

# ── Build ISO ────────────────────────────────────────────────────────────────

echo "==> Building ISO (this takes 5-15 minutes)..."
sudo mkarchiso -v \
    -w "$WORK_DIR" \
    -o "$OUT_DIR" \
    "$SCRIPT_DIR/archiso"

# ── Done ─────────────────────────────────────────────────────────────────────

ISO=$(ls -t "$OUT_DIR"/archaeus-*.iso 2>/dev/null | head -1)

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║           Build Complete!                ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  ISO: $ISO"
echo ""
echo "  Flash to USB:"
echo "    sudo dd if=\"$ISO\" of=/dev/sdX bs=4M status=progress oflag=sync"
echo ""
echo "  Or test in QEMU:"
echo "    qemu-system-x86_64 -m 4G -cdrom \"$ISO\" -boot d -enable-kvm"
echo ""
