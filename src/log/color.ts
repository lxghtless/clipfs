export const ResetColor = '\x1b[0m'
export const Bright = '\x1b[1m'
export const Dim = '\x1b[2m'

// Underscore = "\x1b[4m"
// Blink = "\x1b[5m"
// Reverse = "\x1b[7m"
// Hidden = "\x1b[8m"

export enum Color {
    Reset = 1,
    Black,
    BrightBlack,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    Gray
}

export const colorString = (color: Color): string => {
    let colorStr = ResetColor
    switch (color) {
        case Color.Black: {
            colorStr = '\x1b[30m'
            break
        }
        case Color.BrightBlack: {
            colorStr = `${Bright}\x1b[30m`
            break
        }
        case Color.Red: {
            colorStr = '\x1b[31m'
            break
        }
        case Color.Green: {
            colorStr = '\x1b[32m'
            break
        }
        case Color.Yellow: {
            colorStr = '\x1b[33m'
            break
        }
        case Color.Blue: {
            colorStr = '\x1b[34m'
            break
        }
        case Color.Magenta: {
            colorStr = '\x1b[35m'
            break
        }
        case Color.Cyan: {
            colorStr = '\x1b[36m'
            break
        }
        case Color.White: {
            colorStr = '\x1b[37m'
            break
        }
        case Color.Gray: {
            colorStr = `${Dim}\x1b[37m`
            break
        }
        default: {
            break
        }
    }
    return colorStr
}

export enum BgColor {
    Reset = 1,
    Black,
    BrightBlack,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White,
    BrightWhite,
    DimWhite
}

export const bgColorString = (color: BgColor): string => {
    let bgColorString = ResetColor
    switch (color) {
        case BgColor.Black: {
            bgColorString = '\x1b[40m'
            break
        }
        case BgColor.Red: {
            bgColorString = '\x1b[41m'
            break
        }
        case BgColor.Green: {
            bgColorString = '\x1b[42m'
            break
        }
        case BgColor.Yellow: {
            bgColorString = '\x1b[43m'
            break
        }
        case BgColor.Blue: {
            bgColorString = '\x1b[44m'
            break
        }
        case BgColor.Magenta: {
            bgColorString = '\x1b[45m'
            break
        }
        case BgColor.Cyan: {
            bgColorString = '\x1b[46m'
            break
        }
        case BgColor.White: {
            bgColorString = '\x1b[47m'
            break
        }
        case BgColor.BrightWhite: {
            bgColorString = `${Bright}\x1b[47m`
            break
        }
        case BgColor.DimWhite: {
            bgColorString = `${Dim}\x1b[47m`
            break
        }
        default: {
            break
        }
    }
    return bgColorString
}
