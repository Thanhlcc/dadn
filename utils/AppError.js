class AppError extends Error{
    constructor(message){
        super(message);
        this.statusCode = statusCode;
    }
}