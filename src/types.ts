export interface Args {
    data: string | null
    input: string | null
    output: string | null
    show?: boolean
    piped?: boolean
}

export enum ClipFsErrorCode {
    Internal = 1,
    UnsupportedMask,
    Runtime,
    CorruptArgument,
    InvalidArguments
}

export type NumericMap = {
    [x: number]: string
}

export const StatusCode: NumericMap = {
    1: 'Internal',
    2: 'UnsupportedMask',
    3: 'Runtime',
    4: 'CorruptArgument',
    5: 'InvalidArguments'
}

export interface CfsError {
    message: string
    description: string
    code: ClipFsErrorCode | string | null
    status: string | null
    stack?: string
}

export class ClipFsError extends Error implements CfsError {
    code: ClipFsErrorCode | string | null
    description: string
    status: string | null
    statusCode: string | null

    constructor(
        message: string,
        code: ClipFsErrorCode,
        description: string,
        stack?: string
    ) {
        super(message)
        this.name = ClipFsError.name
        this.description = description
        this.code = code
        this.status = StatusCode[code]
        this.statusCode = this.status
        if (stack) {
            this.stack = stack
        }
    }
}
