import {Args, ClipFsError, ClipFsErrorCode} from './types'
import {Cancel, FutureInstance} from 'fluture'
import {Mask, MaskDatum} from 'mode-mask/dist/interfaces'

import log from './log'
import {sumUp} from './util'

export interface QueryMask {
    [x: string]: number
}

export type QueryFunction = (
    args: Args
) => FutureInstance<unknown, void> | Cancel

export interface QueryItem {
    query: QueryFunction
    values: number[]
    sum: number
}

export interface QueryStore {
    [x: string]: QueryItem
}

export interface QueryEngine {
    fromQuery: (query: Query) => QueryFunction
}

interface QueryMaskDatum extends MaskDatum {
    query: QueryFunction
}

interface QueryData {
    store: QueryStore
    data: QueryMaskDatum[]
}

export type Query = string | string[] | number | number[]

const builQueryData = (mask: Mask, store: QueryStore): QueryData => {
    const data: QueryMaskDatum[] = []

    for (const qsik of Object.keys(store)) {
        const qsi = store[qsik]
        const maskDatum = mask.indexOf(qsi.sum)
        if (maskDatum) {
            data.push({
                ...maskDatum,
                query: qsi.query
            })
        }
    }

    return {
        store,
        data
    }
}

const queryToString = (query: Query): string => {
    if (Array.isArray(query)) {
        return query.join(' ')
    }

    return query.toString()
}

const createCliError = (query: Query): ClipFsError =>
    new ClipFsError(
        'no mask found',
        ClipFsErrorCode.UnsupportedMask,
        `The following query was used, but did not match:\n${queryToString(
            query
        )}`
    )

export const queryEngine = (mask: Mask, store: QueryStore): QueryEngine => ({
    fromQuery: (query: Query): QueryFunction => {
        const futureData = builQueryData(mask, store)

        if (typeof query === 'string') {
            const ffi = futureData.store[query]

            if (ffi) {
                return ffi.query
            }

            throw createCliError(query)
        }

        if (typeof query === 'number') {
            const ffm = mask.indexOf(query)
            log.trace('query detected as number')
            if (ffm) {
                log.trace('query found in mask')
                const ffi = futureData.data.find(fd => fd.sum === ffm.sum)

                if (ffi) {
                    log.trace('query found in query data')
                    return ffi.query
                }
            }

            throw createCliError(query)
        }

        if (
            Array.isArray(query) &&
            query.length !== 0 &&
            typeof query[0] === 'string'
        ) {
            const ffm = mask.fromValues(query as string[])

            if (ffm) {
                const ffi = futureData.data.find(fd => fd.sum === ffm.sum)

                if (ffi) {
                    return ffi.query
                }
            }

            throw createCliError(query)
        }

        if (
            Array.isArray(query) &&
            query.length !== 0 &&
            typeof query[0] === 'number'
        ) {
            const ffm = mask.indexOf(sumUp(query as number[]))

            if (ffm) {
                const ffi = futureData.data.find(fd => fd.sum === ffm.sum)

                if (ffi) {
                    return ffi.query
                }
            }
        }

        throw createCliError(query)
    }
})
