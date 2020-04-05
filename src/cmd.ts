import {Args} from './types'
import {QueryMask, queryEngine} from './query'
import {buildQueryStore, clipFSMask} from './store'
import {registerMask, resolveMask} from 'mode-mask'

import log from './log'
import {
    handleFatalError,
    isPiped,
    sumUp,
    throwCorruptArgumentError,
    throwInvalidArgumentsError,
    validateArgNotArray
} from './util'

const {
    // clipboard read
    cr,
    // clipboard write
    cw,
    // file read
    fr,
    // file write
    fw,
    // input (piped) read
    ir,
    // show
    s
} = clipFSMask as QueryMask

registerMask(Object.keys(clipFSMask))

export const run = async (args: Args, doNotExit?: boolean): Promise<void> => {
    try {
        const {input, output, show} = args

        validateArgNotArray(input, 'input')
        validateArgNotArray(output, 'output')

        const params: number[] = []

        if (show) {
            params.push(s)
        }

        if (output) {
            params.push(fw)
        }

        if (isPiped()) {
            params.push(cw)
            params.push(ir)
        } else {
            if (input) {
                params.push(cw)
                params.push(fr)
            } else if (show) {
                params.push(cr)
            }
        }

        if (params.length === 0) {
            throwInvalidArgumentsError(args)
        }

        const query = sumUp(params)

        if (isNaN(query)) {
            throwCorruptArgumentError(args, query, params)
        }

        const queryStore = buildQueryStore()
        const mask = resolveMask()

        log.trace(`running ${query}`, JSON.stringify(args))

        queryEngine(mask, queryStore).fromQuery(query)(args)
    } catch (error) {
        handleFatalError(error, doNotExit)
    }
}
