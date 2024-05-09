export interface Serializable<T extends {}> {
    restoreFrom: (data: T) => void;
    serialize: () => T;
}
