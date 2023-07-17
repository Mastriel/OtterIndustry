import './app.css'
import App from './App.svelte'
import {getGame} from "./game/Game";
import {Resource} from "./game/resources/resources";
import {modifier} from "./game/utils/modifiers";
import {t7e} from "./utils/i18n";

import "./assets/resourceDeclarations"
import "./assets/commandDeclarations"


getGame().Resources.loadAll()


const app = new App({
  target: document.getElementById('app'),
})


export default app
