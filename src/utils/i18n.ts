import english from "../lang/en_us.json";
import english_gb from "../lang/en_gb.json";

type LangFile = typeof english;
type LangFileKey = RecursiveKeyOf<LangFile>;

export const LANG: LangFile = english_gb as LangFile;

/**
 * Translates any key into the user's requested language.
 * @param key
 */
export const t7e = (key: LangFileKey): string => {
    let path = key.split(".");
    let result: object | string = LANG;
    for (let key of path) {
        result = result[key];
    }
    if (result["charAt"]) {
        return result as string;
    } else {
        return `<${key}>`;
    }
};

// https://stackoverflow.com/questions/65332597/typescript-is-there-a-recursive-keyof wow
export type RecursiveKeyOf<TObj extends object> = {
    [TKey in keyof TObj & (string | number)]: TObj[TKey] extends any[]
        ? `${TKey}`
        : TObj[TKey] extends object
          ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
          : `${TKey}`;
}[keyof TObj & (string | number)];
