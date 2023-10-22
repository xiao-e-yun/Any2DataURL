<template>
  <main>
    <div class="preview split" @drop.prevent="dropHandler" @dragover.prevent @click="uploadImageEl!.click()">
      <h1 v-if="!current">Drag or Select File to DataURL</h1>
      <template v-else>
        <img v-if="current.url" :src="current.url">
        <span>{{ current.name }}</span>
        <CopyVue class="copy" @click.stop="copy(current)" />
      </template>
      <input type="file" @change="inputHandler" ref="uploadImageEl">

    </div>
    <Teleport to="#phone-info" v-if="ready" :disabled="!isPhone">
      <div class="split info">
        <a href="https://github.com/xiao-e-yun/imageToDataURL">
          <h2>Any2DataURL
            <svg xmlns="http://www.w3.org/2000/svg" class="github" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </h2>
        </a>
        <p>Parse Any (Image, Text, Blob, etc..) File to DataURL.</p>
        <ul>
          <li>Fastest</li>
          <li>Record</li>
          <li>Local</li>
        </ul>
        <span><a href="https://xiaoeyun.me">Our Website</a></span>
      </div>
    </Teleport>

  </main>
  <aside>
    <div v-if="logs.length === 0" class="no-record">
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

  <div id="phone-info" />



  <div v-if="copied" class="popper">
    `{{ copied }}` was copied
  </div>
</template>

<script setup lang="ts">
import { blobToData } from "./main.ts"
import { onMounted, reactive, ref } from 'vue';
import CopyVue from "./components/Copy.vue"
import { useMediaQuery } from "@vueuse/core"

const ready = ref(false)
onMounted(() => ready.value = true)

const isPhone = useMediaQuery('(max-width: 720px)')

const uploadImageEl = ref<HTMLInputElement>()

const logs: Pack[] = reactive([])
const current = ref<Pack>()

async function dropHandler(event: DragEvent) {
  if (!event.dataTransfer) return
  for (const file of [...event.dataTransfer.files]) await upload(file)
}

const copied = ref<string>()
async function copy(pack: Pack) {
  if (copied.value === pack.name) return
  const url = await blobToData(pack.file)
  await navigator.clipboard.writeText(url)
  copied.value = pack.name
  setTimeout(() => copied.value = undefined, 5000)
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
  display: flex;
  flex-direction: column;


  @include pe {
    width: 100%;
  }
}

.split {
  height: 50%;
  margin: .4em;
  @include shadow;
  border-radius: .4em;
  background: color.side-3();

  @include pe {
    height: 50vw;
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
    height: auto;
    width: calc(100%);
    overflow: visible;
    & > .no-record {
      @include shadow;
      background: color.side-2();
      padding: 1em 0.4em 1.2em;
      height: auto;
  
      background: color.side-3();
      border-radius: .4em;
      margin: .4em;
      & h2, & p {
        margin: .2em 0 ;
        text-align: center;
      }
    }
  }

  &>.item {
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

        &>path {
          fill: #fff2e8;
        }
      }

      &>img {
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

    &>span {
      position: absolute;
      margin: 1em .4em;
      border-radius: .4em;
      padding: 0 .4em;
      font-size: .6em;
      background: color.bg();
    }


    &>img {
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
  position: relative;

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

  &>img {
    border-radius: 1.4em;
    object-fit: contain;
    position: absolute;
    padding: 1em;
    height: 100%;
    width: 100%;
  }

  &>span {
    position: absolute;
    bottom: .5em;
    left: .5em;
    backdrop-filter: blur(4px);
    background: color.side-2(.6);
    @include shadow;
    padding: .2em;
    border-radius: .4em;
  }

  &>input {
    display: none;
  }
}

.info {
  position: relative;
  overflow: overlay;
  padding: 1em;

  & span {
    position: absolute;
    bottom: .5em;
    right: .5em;
  }

  & h2 {
    margin: 0 0 1em 0;
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

.github {
  width: .8em;
  height: .8em;
}</style>
