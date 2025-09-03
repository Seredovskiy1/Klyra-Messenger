# 🔊 Custom Notification Sound

## 🎵 How to add your own notification sound:

1. **Place your MP3 file** in this folder (`klyra-desktop/src/assets/sounds/`)
2. **Rename it to** `notification.mp3`
3. **Make sure it's in MP3 format** and preferably short (1-3 seconds)
4. **Restart the application** for changes to take effect

## 📋 File requirements:
- **Format**: MP3 only
- **Size**: Preferably under 1MB
- **Duration**: 1-3 seconds recommended
- **Volume**: The app will automatically set volume to 20%
- **Quality**: Any bitrate (app will normalize)

## 🔄 Fallback system:
If your custom sound file is not found or fails to load, the app will automatically use a generated sound instead. This ensures you always get notifications even if the custom file is missing.

## 📁 Example file structure:
```
klyra-desktop/src/assets/sounds/
├── notification.mp3  ← Your custom sound file
└── README.md         ← This file
```

## 🔒 Privacy note:
- Sound files are stored locally on your device
- No sound data is transmitted over the network
- Custom sounds are not shared with other users
- Sound playback is completely anonymous

## 🎯 Usage:
- **New messages**: Plays when you receive messages from other users
- **Volume control**: Automatically set to 20% for privacy
- **No logging**: Sound events are not logged or tracked

That's it! Your custom sound will be played when you receive new messages in the anonymous chat.
