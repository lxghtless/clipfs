import {Args, ClipFsError, ClipFsErrorCode} from './types'
import log from './log'

export const sumUp = (nums: number[]): number =>
    nums.reduce((total, number) => total + number, 0)

export const isPiped = (): boolean => {
    return !process.stdin.isTTY
}

export const handleFatalError = (
    error: Error,
    doNotShutDown?: boolean
): void => {
    let exitCode = 1

    if (error.name === ClipFsError.name) {
        const {code} = error as ClipFsError
        if (code) {
            exitCode = parseInt(code.toString(), 10)
        }
    }

    log.fatal(error)

    if (doNotShutDown) {
        log.warn(
            'fatal error handled, but the --doNotExit flag was set to true'
        )
    } else {
        process.exit(exitCode)
    }
}

export const validateArgNotArray = (
    arg: string | any[] | null,
    argName: string
): void => {
    if (Array.isArray(arg)) {
        throw new ClipFsError(
            'corrupt argumets',
            ClipFsErrorCode.CorruptArgument,
            `The ${argName} argument was an array of ${arg.length}x (${arg.join(
                ' '
            )}). expected a string`
        )
    }
}

export const throwCorruptArgumentError = (
    args: Args,
    query: number,
    params: number[]
): void => {
    const {input, output, show} = args
    throw new ClipFsError(
        'corrupt query',
        ClipFsErrorCode.CorruptArgument,
        `A query of ${query} resulted from ${
            params.length
        }x params=(${params.join(
            ' '
        )}) input=${input} output=${output} show=${show} piped=${isPiped()}`
    )
}

export const throwInvalidArgumentsError = (args: Args): void => {
    const {input, output, show} = args
    throw new ClipFsError(
        'invalid arugments',
        ClipFsErrorCode.InvalidArguments,
        `An empty setup of params resulted from input=${input} output=${output} show=${show} piped=${isPiped()}`
    )
}
