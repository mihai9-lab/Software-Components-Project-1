const isParamObject = (obj, param) => {
    if (getType(obj) != 'o') {
        console.log(obj)
        throw new Error(`Parameter ${param} is not object`);
    }
};
const getType = (obj) => {
    if (Array.isArray(obj)) return 'a';
    else if (typeof obj == 'string') return 's';
    else if (obj != null && typeof obj == 'object') return 'o';
    else return 'e';
};

exports.isParamObject = isParamObject;
exports.getType = getType;
