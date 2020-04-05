#!/usr/bin/env node
'use strict'

import cfonts from 'cfonts'
import {argv} from 'yargs'
import {run, isPiped} from './src'

const showHelp = () => {
    console.log('    ')
    cfonts.say('clipfs', {
        font: 'chrome',
        align: 'left',
        colors: ['#444952', '#696d74', '#00e69a'],
        background: 'transparent',
        space: false,
        env: 'node'
    })

    const helpMenuItems: string[] = []

    helpMenuItems.push(
        'show clipboard content (available in combination with any command)\nclipfs -s'
    )
    helpMenuItems.push('copy file to clipboard\nclipfs ~/some.txt')
    helpMenuItems.push('write clipboard to file\nclipfs -o ~/clipboard.txt')
    helpMenuItems.push(
        'copy file to clipboard then write clipboard to file\nclipfs ~/some.txt -o ~/clipboard.txt'
    )
    helpMenuItems.push('pipe text into clipboard\ncat ~/some.txt | clipfs')
    helpMenuItems.push(
        'pipe text into clipboard then write clipboard to file\ncat ~/some.txt | clipfs -o ~/clipboard.txt'
    )

    console.log(`\n\x1b[2m${helpMenuItems.join('\n\n')}\n\x1b[0m`)
}

if (argv.help || argv.h) {
    showHelp()
} else {
    const show = (argv.show ?? argv.s) as boolean
    const output = (argv.output ?? argv.out ?? argv.o) as string
    const inputAsParam = argv.input ?? argv.in ?? argv.i
    const input = !inputAsParam
        ? argv._ && argv._.length !== 0
            ? argv._[0]
            : null
        : (inputAsParam as string)

    if (!show && !output && !input && !isPiped()) {
        showHelp()
    } else {
        run({
            show,
            output,
            input,
            data: null
        })
    }
}
