#!/bin/bash
# Android SDK and Java environment configuration
# Source this file: source android-env.sh

export ANDROID_HOME="$HOME/Android/Sdk"
export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

echo "✅ Android environment configured"
echo "  ANDROID_HOME: $ANDROID_HOME"
echo "  JAVA_HOME: $JAVA_HOME"
