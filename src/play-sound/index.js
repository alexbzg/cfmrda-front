export default function (sound) {
  if (sound)
    sound.play()
      .then(() => {
      })
      .catch(() => {
      })
}

