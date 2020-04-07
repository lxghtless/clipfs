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

        const queryStore = buildQueryStore()
        const mask = resolveMask()

        const params: number[] = []

        if (isPiped()) {
            params.push(ir)
            params.push(cw)
        } else if (input) {
            params.push(fr)
            params.push(cw)
        }

        if (output) {
            params.push(fw)
        }

        if (params.length !== 0) {
            const cmask = mask.indexOf(sumUp(params))
            if (cmask) {
                if (!cmask.nums.includes(cw)) {
                    params.push(cr)
                }
            }
        }

        if (!show && params.length === 0) {
            throwInvalidArgumentsError(args)
        }

        if (show) {
            params.push(s)
            const cmask = mask.indexOf(sumUp(params))
            if (cmask) {
                if (!cmask.nums.includes(cw) && !cmask.nums.includes(cr)) {
                    params.push(cr)
                }
            }
        }

        const query = sumUp(params)

        if (isNaN(query)) {
            throwCorruptArgumentError(args, query, params)
        }

        log.trace(`running ${query}`, JSON.stringify(args))

        queryEngine(mask, queryStore).fromQuery(query)(args)
    } catch (error) {
        handleFatalError(error, doNotExit)
    }
}
