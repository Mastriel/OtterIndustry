


export type Emoji = "flower" | "warning" | "shift" | "reset" | "command" | "resource"
export type EmojiData = {
    url: string,
    width: number
}

export const emojis = new Map<Emoji, EmojiData>()


emojis.set("flower", {url: "/name-decor.png", width: 15})
    .set("warning", {url: "/warning.png", width: 15})
    .set("shift", {url: "/shift.png", width: 40})
    .set("reset", {url: "/reset.png", width: 15})
    .set("command", {url: "/command.png", width: 57})
    .set("resource", {url: "/resource.png", width: 58})
