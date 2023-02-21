const _ = require("lodash");

class ResponseHandler {
    static sendSuccess(res, message, status) {
        const funcName = "sendSuccess";
        return (data, globalData) => {
            if (_.isUndefined(status)) status = 200;
            console.log(`[${funcName}] data:`, data);
            res.status(status).json({
                type: "success",
                message: message || "success result",
                data,
                ...globalData,
            });
        };
    }

    static sendClientError(status, req, res, errorMessage) {
        const funcName = "sendClientError";
        console.error(`[${funcName}]`, errorMessage);
        return res.status(status).json({
            type: "client_issue",
            message: errorMessage || "client issue",
        });
    }

    static sendServerError(status, req, res, error) {
        const funcName = "sendServerError";
        console.error(`[${funcName}]`, error);
        return res.status(status).json({
            type: "server_issue",
            message: error.message || "server issue",
        });
    }
}

module.exports = ResponseHandler;
