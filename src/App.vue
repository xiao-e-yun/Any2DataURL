<template>
  <main>
    <div class="preview split" @drop.prevent="dropHandler" @dragover.prevent @click="uploadImageEl!.click()">
      <h1 v-if="!current">Select image to DataURL</h1>
      <template v-else>
        <img v-if="current.url" :src="current.url">
        <span>{{ current.name }}</span>
        <CopyVue class="copy" @click.stop="copy(current)" />
      </template>
      <input type="file" @change="inputHandler" ref="uploadImageEl">
      
    </div>
    
  </main>
  <aside>
    <div v-if="logs.length===0">
      <h2>Records</h2>
      <p>It will be kept here until the page is closed or reload.</p>
      <p>You can click to copy DataURL.</p>
    </div>
    <div v-else v-for="log in logs" class="item">
      <img v-if="log.url" :src="log.url">
      <span>{{ log.name }}</span>
      <CopyVue class="copy" @click.stop="copy(log)" />
    </div>
  </aside>
  <div v-if="copied" class="popper">
    `{{copied}}` was copied
  </div>
</template>

<script setup lang="ts">
import { blobToData } from "./main.ts"
import { reactive, ref } from 'vue';
import CopyVue from "./components/Copy.vue"

const uploadImageEl = ref<HTMLInputElement>()

const logs: Pack[] = reactive([])
const current = ref<Pack>()

async function dropHandler(event: DragEvent) {
  if (!event.dataTransfer) return
  for (const file of [...event.dataTransfer.files]) await upload(file)
}

const copied = ref<string>()
async function copy(pack: Pack) {
  if(copied.value === pack.name) return
  const url = await blobToData(pack.file)
  await navigator.clipboard.writeText(url)
  copied.value = pack.name
  setTimeout(()=>copied.value=undefined,5000)
}

function inputHandler(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files!
  const file = files[0]
  upload(file)
}

async function upload(file: File) {
  if (!file) return
  
  const name = file.name
  let url = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined

  if (current.value) logs.unshift(current.value)

  current.value = {
    file,
    name,
    url,
  }
}

interface Pack {
  url?: string,
  name: string,
  file: File,
}
</script>

<style lang="scss">
@import "./assets/style/page.scss";

#app {
  width: 100vw;
  height: 100vh;
  display: flex;

  overflow: hidden;
  @include pe {
    overflow: auto;
    flex-direction: column;
  }
}

main {
  width: 70%;
  gap: .4em;
  display: flex;
  padding: .4em;
  flex-direction: column;

  
  @include pe {
    width: 100%;
  }
  & > .split {
    height: 50%;
    @include pe {
      height: 50vw;
    }
  }
}

aside {
  width: 30%;
  height: 100vh;
  overflow: auto;

  & h2 {
    margin: 1em 0 0 0;
  }

  & p {
    margin: 0;
  }

  @include pe {
    overflow: visible;
    height: auto;
    width: 100%;
  }

  & > .item {
    margin: .4em;
    @include shadow;
    overflow: hidden;
    position: relative;
    aspect-ratio: 2 / 1;
    border-radius: .4em;
    background: color.side-3();
    cursor: pointer;
    
    &:hover {
      & .copy {
        opacity: 1;
      }

      & > img {
        filter: brightness(30%);
      }
    }

    & .copy {
      position: absolute;
      transition: opacity .4s;
      margin: auto;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      opacity: 0;
    }

    & > span {
      position: absolute;
      margin: 1em .4em;
      border-radius: .4em;
      padding: 0 .4em;
      font-size: .6em;
      background: color.bg();
    }
    

    & > img {
      left: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      transition: filter .4s;
    }
  }
}

.preview {
  display: flex;
  justify-content: center;
  align-items: center;
  background: color.side-3();
  border-radius: .4em;
  position: relative;
  @include shadow;
  
  & .copy {
    position: absolute;
    right: .6em;
    top: .6em;
    width: 2.4em;
    height: 2.4em;
    @include shadow;
    cursor: pointer;
    border-radius: .4em;
    backdrop-filter: blur(4px);
    background: color.side-2(.6);
  }

  & > img {
    border-radius: 1.4em;
    object-fit: contain;
    position: absolute;
    padding: 1em;
    height: 100%;
    width: 100%;
  }

  & > span {
    position: absolute;
    bottom: .5em;
    left: .5em;
    backdrop-filter: blur(4px);
    background: color.side-2(.6);
    @include shadow;
    padding: .2em;
    border-radius: .4em;
  }

  & > input {
    display: none;
  }
}

.popper {
  pointer-events: none;
  position: fixed;
  margin: 1em auto;
  top: 0;
  left: 0;
  right: 0;
  padding: .4em 1em;
  width: fit-content;
  border-radius: .4em;
  color: color.bg();
  background: color.main();
  @include shadow(2);
}

.copy {
  height: 80%;
}
</style>