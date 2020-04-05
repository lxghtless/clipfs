import {Nodeback, chain, encaseP, fork, node} from 'fluture'
import {QueryItem, QueryMask, QueryStore} from './query'

import {Args} from './types'
import clipboardy from 'clipboardy'
import fs from 'fs-extra'
import getStdin from 'get-stdin'
import log from './log'
import {sumUp} from './util'

const showMessage = (ctx: Args) => log.message(ctx.data)

// clipboard read
const cr = 1

// clipboard write
const cw = 2

// file read
const fr = 4

// file write
const fw = 8

// input (piped) read
const ir = 16

// show 32
const s = 32

/**
 * @namespace QueryMask ClipFSMask
 * @property {number} cr 1
 * @property {number} cw 2
 * @property {number} fr 4
 * @property {number} fw 8
 * @property {number} ir 16
 * @property {number} s 32
 */
export const clipFSMask: QueryMask = {
    cr,
    cw,
    fr,
    fw,
    ir,
    s
}

export const buildQueryStore = (): QueryStore => {
    // file read -> clipboard write ✅
    const frcwNumbers = [fr, cw]
    const frcw: QueryItem = {
        query: (ctx: Args) => {
            return node<Error, Args>((done: Nodeback<Error, Args>) => {
                fs.readFile(ctx.input as string, 'utf8', (error, data) => {
                    if (error) {
                        done(error, ctx)
                        return
                    }

                    ctx.data = data
                    done(null, ctx)
                })
            })
                .pipe(
                    chain(encaseP(ctx => clipboardy.write(ctx.data as string)))
                )
                .pipe(fork(log.empty)(log.empty))
        },
        values: frcwNumbers,
        sum: sumUp(frcwNumbers)
    }

    // file read -> clipboard write -> show ✅
    const frcwsNumbers = [fr, cw, s]
    const frcws: QueryItem = {
        query: (ctx: Args) => {
            return node<Error, Args>((done: Nodeback<Error, Args>) => {
                fs.readFile(ctx.input as string, 'utf8', (error, data) => {
                    if (error) {
                        done(error, ctx)
                        return
                    }

                    ctx.data = data
                    done(null, ctx)
                })
            })
                .pipe(
                    chain(
                        encaseP(async ctx => {
                            await clipboardy.write(ctx.data as string)
                            return ctx
                        })
                    )
                )
                .pipe(fork(log.error)(showMessage))
        },
        values: frcwsNumbers,
        sum: sumUp(frcwsNumbers)
    }

    // file read -> clipboard write -> file write ✅
    const frcwfwNumbers = [fr, cw, fw]
    const frcwfw: QueryItem = {
        query: (ctx: Args) => {
            return node<Error, Args>((done: Nodeback<Error, Args>) => {
                fs.readFile(ctx.input as string, 'utf8', (error, data) => {
                    if (error) {
                        done(error, ctx)
                        return
                    }

                    ctx.data = data
                    done(null, ctx)
                })
            })
                .pipe(
                    chain(
                        encaseP(async ctx => {
                            await clipboardy.write(ctx.data as string)
                            return ctx
                        })
                    )
                )
                .pipe(
                    chain(
                        encaseP(async ctx => {
                            await fs.outputFile(
                                ctx.output as string,
                                ctx.data as string
                            )
                            return ctx
                        })
                    )
                )
                .pipe(fork(log.error)(log.empty))
        },
        values: frcwfwNumbers,
        sum: sumUp(frcwfwNumbers)
    }

    // file read -> clipboard write -> file write -> show ✅
    const frcwfwsNumbers = [fr, cw, fw, s]
    const frcwfws: QueryItem = {
        query: (ctx: Args) => {
            return node<Error, Args>((done: Nodeback<Error, Args>) => {
                fs.readFile(ctx.input as string, 'utf8', (error, data) => {
                    if (error) {
                        done(error, ctx)
                        return
                    }

                    ctx.data = data
                    done(null, ctx)
                })
            })
                .pipe(
                    chain(
                        encaseP(async ctx => {
                            await clipboardy.write(ctx.data as string)
                            return ctx
                        })
                    )
                )
                .pipe(
                    chain(
                        encaseP(async ctx => {
                            await fs.outputFile(
                                ctx.output as string,
                                ctx.data as string
                            )
                            return ctx
                        })
                    )
                )
                .pipe(fork(log.error)(showMessage))
        },
        values: frcwfwsNumbers,
        sum: sumUp(frcwfwsNumbers)
    }

    // clipboard read -> show ✅
    const crsNumbers = [cr, s]
    const crs: QueryItem = {
        query: (ctx: Args) => {
            log.trace(`crs (33) ${ctx.show}`)
            return encaseP(clipboardy.read)(undefined).pipe(
                fork(log.error)(log.message)
            )
        },
        values: crsNumbers,
        sum: sumUp(crsNumbers)
    }

    // clipboard read -> file write ✅
    const crfwNumbers = [cr, fw]
    const crfw: QueryItem = {
        query: (ctx: Args) => {
            return encaseP(clipboardy.read)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await fs.outputFile(ctx.output as string, data)
                        })
                    )
                )
                .pipe(fork(log.error)(log.empty))
        },
        values: crfwNumbers,
        sum: sumUp(crfwNumbers)
    }

    // clipboard read -> file write -> show ✅
    const crfwsNumbers = [cr, fw, s]
    const crfws: QueryItem = {
        query: (ctx: Args) => {
            return encaseP(clipboardy.read)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await fs.outputFile(ctx.output as string, data)
                            return data
                        })
                    )
                )
                .pipe(fork(log.error)(log.message))
        },
        values: crfwsNumbers,
        sum: sumUp(crfwsNumbers)
    }

    // input (piped) read -> clipboard write ✅
    const ircwNumbers = [ir, cw]
    const ircw: QueryItem = {
        query: (ctx: Args) => {
            log.trace(`ctx.piped ${ctx.piped}`)
            return encaseP(getStdin)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await clipboardy.write(data)
                            return data
                        })
                    )
                )
                .pipe(fork(log.error)(log.empty))
        },
        values: ircwNumbers,
        sum: sumUp(ircwNumbers)
    }

    // input (piped) read -> clipboard write -> show ✅
    const ircwsNumbers = [ir, cw, s]
    const ircws: QueryItem = {
        query: (ctx: Args) => {
            log.trace(`ctx.piped ${ctx.piped} ctx.show: ${ctx.show}`)
            return encaseP(getStdin)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await clipboardy.write(data)
                            return data
                        })
                    )
                )
                .pipe(fork(log.error)(log.message))
        },
        values: ircwsNumbers,
        sum: sumUp(ircwsNumbers)
    }

    // input (piped) read -> clipboard write -> file write ✅
    const ircwfwNumbers = [ir, cw, fw]
    const ircwfw: QueryItem = {
        query: (ctx: Args) => {
            return encaseP(getStdin)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await clipboardy.write(data)
                            return data
                        })
                    )
                )
                .pipe(
                    chain(
                        encaseP(async data => {
                            await fs.outputFile(ctx.output as string, data)
                            return data
                        })
                    )
                )
                .pipe(fork(log.error)(log.empty))
        },
        values: ircwfwNumbers,
        sum: sumUp(ircwfwNumbers)
    }

    // input (piped) read -> clipboard write -> file write -> show ✅
    const ircwfwsNumbers = [ir, cw, fw, s]
    const ircwfws: QueryItem = {
        query: (ctx: Args) => {
            return encaseP(getStdin)(undefined)
                .pipe(
                    chain(
                        encaseP(async data => {
                            await clipboardy.write(data)
                            return data
                        })
                    )
                )
                .pipe(
                    chain(
                        encaseP(async data => {
                            await fs.outputFile(ctx.output as string, data)
                            return data
                        })
                    )
                )
                .pipe(fork(log.error)(log.message))
        },
        values: ircwfwsNumbers,
        sum: sumUp(ircwfwsNumbers)
    }

    // show ✅
    const sNumbers = [s]
    const show: QueryItem = {
        query: (ctx: Args) => {
            log.trace(`ctx.show: ${ctx.show}`)
            return encaseP(clipboardy.read)(undefined).pipe(
                fork(log.error)(log.message)
            )
        },
        values: sNumbers,
        sum: sumUp(sNumbers)
    }

    const store: QueryStore = {
        frcw,
        frcws,
        frcwfw,
        frcwfws,
        crs,
        crfw,
        crfws,
        ircw,
        ircws,
        ircwfw,
        ircwfws,
        s: show
    }

    return store
}
