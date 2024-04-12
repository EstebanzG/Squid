import {Main} from "./main.ts";

import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="container"/>
`

new Main();