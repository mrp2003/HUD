#!/bin/bash
set -e

echo "🚀 Setting up Android SDK for React Native (CLI only)..."

# Create Android SDK directory
ANDROID_HOME="$HOME/Android/Sdk"
mkdir -p "$ANDROID_HOME"
cd "$ANDROID_HOME"

# Download command-line tools
echo "📦 Downloading Android command-line tools..."
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
wget -O cmdline-tools.zip "$CMDLINE_TOOLS_URL"

# Extract to correct directory structure
echo "📂 Extracting tools..."
mkdir -p cmdline-tools
unzip -q cmdline-tools.zip -d cmdline-tools
mv cmdline-tools/cmdline-tools cmdline-tools/latest
rm cmdline-tools.zip

# Set up environment variables
echo "🔧 Configuring environment..."
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

# Install required packages
echo "📥 Installing Android SDK packages..."
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

echo "✅ Android SDK setup complete!"
echo ""
echo "Add these to your ~/.bashrc or ~/.zshrc:"
echo "export ANDROID_HOME=$HOME/Android/Sdk"
echo "export PATH=\$PATH:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools"
