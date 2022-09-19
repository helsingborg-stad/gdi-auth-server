
interface GetEnvArgs {
    key: string,
    trim?: boolean,
    validate?: (v: string) => boolean,
    fallback?: string
}

const notFound = key => (): string => {
    throw Error(`Failed to read and validate environment ${key}="${process.env[key]}"`)
}

const tryValidate = (key: string, value: string, validate: (v: string) => boolean) => {
    try {
        return validate(value)
    } catch {
        throw Error(`Failed to read and validate environment ${key}="${process.env[key]}"`)
    }
}

const getEnv = ({key, trim, validate, fallback}: GetEnvArgs): string => [process.env[key], fallback]
        .filter(v => typeof v === 'string')
        .map(v => trim? v.trim(): v)
        .filter(v => tryValidate(key, v, validate || (() => true)))
        .map(value => () => value)
        .concat(notFound(key))
        [0]()

export {
    getEnv
}