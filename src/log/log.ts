/* eslint-disable @typescript-eslint/no-explicit-any */
import {Bright, Color, Dim, ResetColor, colorString} from './color'

// import {BgColor, bgColorString, Bright, Color, colorString, Dim, ResetColor} from './color'
import {ClipFsError} from '../types'

export interface LogLevel {
    [x: string]: number
    fatal: number
    error: number
    message: number
    info: number
    debug: number
    trace: number
    silent: number
}

export type LogFunc = (...args: any[]) => void
export type AsyncLogFunc = (...args: any[]) => Promise<void>
export type LogPingFunc = () => void

export interface Logger {
    empty: LogFunc
    ping: LogPingFunc
    message: LogFunc
    messageAsync: AsyncLogFunc
    trace: LogFunc
    debug: LogFunc
    info: LogFunc
    warn: LogFunc
    error: LogFunc
    fatal: LogFunc
}

export const ClipFsLogLevel: LogLevel = {
    fatal: 1,
    error: 2,
    message: 3,
    info: 4,
    debug: 5,
    trace: 6,
    silent: 7
}

const NewLine = '\n'

const getCurrentLogLevel = (): number => {
    return ClipFsLogLevel[process.env.CLIPFS_LOG_LEVEL ?? 'message']
}

const getLogColors = (): boolean => {
    return process.env.CLIPFS_LOG_COLORS === 'true'
}

const getPingMessage = (): string =>
    `ping: log level ${getCurrentLogLevel()} log colors ${
        getLogColors() ? 'on' : 'off'
    }`

const argsAsString = (...args: any[]): string => args.join(' ')

const withColor = (color: Color, ...args: any[]): string => {
    return `${colorString(color)}${argsAsString(
        ...args
    )}${ResetColor}${NewLine}`
}

const valueWithColor = (color: Color, value: string): string =>
    `${colorString(color)}${value}${ResetColor}`

const logStdOut = (...args: any[]): boolean =>
    process.stdout.write(argsAsString(...args))

const logNoColor = (...args: any[]): boolean => {
    return logStdOut([argsAsString(...args), NewLine].join(''))
}

const logWithColor = (color: Color, ...args: any[]): boolean => {
    return logStdOut(withColor(color, ...args))
}

// const logWithBgColor = (color: Color, bgColor: BgColor, ...args: any[]): boolean => {
//     return logStdOut(`${bgColorString(bgColor)}${withColor(color, ...args)}`)
// }

const logErrorNoColor = (...args: any[]): boolean => {
    let error = args[0]

    if (error && Array.isArray(error)) {
        error = error[0]
    }

    if (!error) {
        return true
    }

    if (typeof error === 'string') {
        return logNoColor(error)
    }

    const errorParts: string[] = []

    if (error.name === ClipFsError.name) {
        errorParts.push(error.name)

        if (error.code) {
            errorParts.push(`code: ${error.code.toString()}`)
        }

        if (error.status) {
            errorParts.push(`status: ${error.status}`)
        }

        if (error.description) {
            errorParts.push(error.description)
        }
    }

    if (error.stack) {
        errorParts.push(error.stack)
    }

    return logNoColor(errorParts.join('\n'))
}

const logErrorWithColor = (...args: any[]): boolean => {
    let error = args[0]

    if (error && Array.isArray(error)) {
        error = error[0]
    }

    if (!error) {
        return true
    }

    if (typeof error === 'string') {
        return logWithColor(Color.Magenta, error)
    }

    const errorParts: string[] = []

    if (error.name === ClipFsError.name) {
        errorParts.push(valueWithColor(Color.Magenta, `${Bright}${error.name}`))

        if (error.code) {
            errorParts.push(
                valueWithColor(
                    Color.Magenta,
                    `${Dim}code: ${error.code.toString()}`
                )
            )
        }

        if (error.status) {
            errorParts.push(
                valueWithColor(Color.Magenta, `${Dim}status: ${error.status}`)
            )
        }

        if (error.description) {
            errorParts.push(
                valueWithColor(Color.Yellow, `${Bright}${error.description}`)
            )
        }
    }

    if (error.stack) {
        errorParts.push(valueWithColor(Color.Magenta, error.stack))
    }

    return logWithColor(Color.Magenta, errorParts.join('\n'))
}

const levelInvoker = (level: number, func: LogPingFunc): void => {
    if (getCurrentLogLevel() === ClipFsLogLevel.silent) {
        return
    }

    if (getCurrentLogLevel() < level) {
        return
    }

    func()
}

const logFactory = (): Logger => ({
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    empty: (): void => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    ping: (): void => {},
    message: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.message, (): boolean =>
            getLogColors()
                ? logWithColor(Color.Green, ...args)
                : logNoColor(...args)
        ),
    messageAsync: (...args: any[]): Promise<void> =>
        Promise.resolve(
            levelInvoker(ClipFsLogLevel.message, (): boolean =>
                getLogColors()
                    ? logWithColor(Color.Green, ...args)
                    : logNoColor(...args)
            )
        ),
    trace: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.trace, (): boolean =>
            getLogColors()
                ? logWithColor(Color.Gray, ...args)
                : logNoColor(...args)
        ),
    debug: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.debug, (): boolean =>
            getLogColors()
                ? logWithColor(Color.Cyan, ...args)
                : logNoColor(...args)
        ),
    info: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.info, (): boolean =>
            getLogColors()
                ? logWithColor(Color.Blue, ...args)
                : logNoColor(...args)
        ),
    warn: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.warn, (): boolean =>
            getLogColors()
                ? logWithColor(Color.Yellow, ...args)
                : logNoColor(...args)
        ),
    // TODO: update both of these to log to the correct function if they are strings are any[]
    error: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.error, (): boolean =>
            getLogColors() ? logErrorWithColor(args) : logErrorNoColor(args)
        ),
    fatal: (...args: any[]): void =>
        levelInvoker(ClipFsLogLevel.fatal, (): boolean =>
            getLogColors() ? logErrorWithColor(args) : logErrorNoColor(args)
        )
})

const log = logFactory()
const ping = (): void => log.debug(getPingMessage())
log.ping = ping.bind(log)

export default log

/* eslint-enable @typescript-eslint/no-explicit-any */
