/**
 * Class khusus untuk menangani error HTTP dengan status code tertentu.
 */
export class ResponseError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
