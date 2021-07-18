class BaseError {
    constructor () {
        Error.apply(this, arguments);
    }
}

export class HttpRequestError extends BaseError {
    constructor (public status: number, public message: string) {
        super();
    }
}