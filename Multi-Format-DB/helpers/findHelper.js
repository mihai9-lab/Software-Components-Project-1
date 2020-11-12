const getType = require('./objHelper').getType;

const findByVal = (data, val) => {
    switch (getType(val)) {
        case 'a':
            if (Array.isArray(data) && data.length === val.length) {
                if (val.toString() === data.toString()) {
                    return true;
                }
            }
            return false;
        case 'o':
            return searchObj(data, val);
        case 's':
        case 'e':
            return val === data;
        default:
            return false;
    }
};

const searchObj = (data, val) => {
    return Object.keys(val).every((key) => {
        if (data[key] === undefined) {
            return false;
        }
        return findByVal(data[key], val[key]);
    });
};

exports.findByVal = findByVal;
