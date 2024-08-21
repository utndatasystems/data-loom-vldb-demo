#!/bin/bash

# Create profiling dir
mkdir -p profiling

# Download .jar files
wget -O profiling/metanome-cli-1.1.0.jar https://github.com/sekruse/metanome-cli/releases/download/v1.1.0/metanome-cli-1.1.0.jar
wget -O profiling/pyro-distro-1.0-SNAPSHOT-distro.jar https://github.com/sekruse/pyro/releases/download/v1.0-RC1/pyro-distro-1.0-SNAPSHOT-distro.jar

echo "Download complete. Saved in profiling/."
