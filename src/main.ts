console.log("Wah!!!");

import "./app.css";
import App from "./App.svelte";
import { getGame } from "./game/Game";

import "./assets/resourceDeclarations";
import "./assets/commandDeclarations";

getGame().Resources.loadAll();

const app = new App({
    target: document.getElementById("app"),
});

export default app;
