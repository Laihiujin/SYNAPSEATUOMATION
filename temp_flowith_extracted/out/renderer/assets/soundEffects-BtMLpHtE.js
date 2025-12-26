const doneSoundUrl = "" + new URL("done-C5jyElFp.mp3", import.meta.url).href;
const failSoundUrl = "" + new URL("fail-vP1PMwdl.mp3", import.meta.url).href;
const clickSoundUrl = "" + new URL("click-Dkrxvmhz.wav", import.meta.url).href;
function playAudioAsset(src, volume = 0.6) {
  try {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = Math.min(Math.max(volume, 0), 1);
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((error) => {
        console.debug("[SoundEffects] Audio playback was interrupted:", error);
      });
    }
  } catch (error) {
    console.debug("[SoundEffects] Audio playback failed:", error);
  }
}
function playDoneSound() {
  playAudioAsset(doneSoundUrl, 0.65);
}
function playFailSound() {
  playAudioAsset(failSoundUrl, 0.65);
}
function playClickSound() {
  playAudioAsset(clickSoundUrl, 0.65);
}
export {
  playClickSound,
  playDoneSound,
  playFailSound
};
