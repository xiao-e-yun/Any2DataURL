import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

/// ref by https://stackoverflow.com/a/63372663/15859431
export const blobToData = (blob: Blob) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}