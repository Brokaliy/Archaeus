#!/bin/bash
# Archaeus live boot auto-script
# Runs as root on live environment boot

# Set keymap
loadkeys us

# Start network manager
systemctl start NetworkManager

# Short pause for services to settle
sleep 1

# Launch the installer in the current terminal
clear
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║                                          ║"
echo "  ║           A R C H A E U S               ║"
echo "  ║         your system, your way            ║"
echo "  ║                                          ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  Loading installer..."
sleep 1

exec archaeus-installer
