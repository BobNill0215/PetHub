"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.fail = fail;
exports.paginated = paginated;
function success(res, data = null, status = 200) {
    return res.status(status).json({ code: 0, message: 'ok', data });
}
function fail(res, message, code = 40001, status = 400) {
    return res.status(status).json({ code, message, data: null });
}
function paginated(res, data, total, page, pageSize) {
    return res.status(200).json({
        code: 0,
        message: 'ok',
        data,
        total,
        page,
        page_size: pageSize,
    });
}
//# sourceMappingURL=index.js.map