
export type Result<T, E = string> = {
    get: () => T,
    error: E,
    isOk: boolean
}


export const resultSuccess = <T, E = string>(value: T) : Result<T, E> => {
    return {
        get: () => value,
        isOk: true,
        error: undefined
    }
}

export const resultFailure = <T, E = string>(error: E) : Result<T, E> => {
    return {
        get: () => { throw error },
        error,
        isOk: false
    }
}

export const resultAuto = <T, E = string>(value?: T, error?: E) : Result<T, E> => {
    if (value == undefined) return resultFailure(error)
    return resultSuccess(value)
}