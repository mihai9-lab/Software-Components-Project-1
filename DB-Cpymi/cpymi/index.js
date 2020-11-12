const stringify = (data) => {
    let string = 'START\n';

    for (let key in data) {
        string += getTypeStringify(key, data[key]);
    }
    string += 'END\n';
    return string;
};

const stringifyArr = (value) => {
    let string = '';
    value.forEach((val) => {
        string += getTypeStringify('\v',val);

    });
    return string + '\v\t\n';
};

const getTypeStringify = (key, data) => {
    let string = key + '\t';
    if (Array.isArray(data)) return string + stringifyArr(data);
    else if (typeof data == 'string') return string + '"' + data + '"\t\n';
    else if (data != null && typeof data == 'object') return string + stringify(data);
    else return string + data + '\t\n';
};

const pos = (string, cur, el) => {
    let ind = string.indexOf(el, cur);
    if (ind > -1) {
        return ind;
    }
    return 0;
};
const parse = (string, cur) => {
    return parseObj(string, 0)[1];
};

const getTypeParse = (string, cur) => {
    let value;
    if (string[cur] === '"') {
        let e = pos(string, cur, '\t\n');
        value = [e + 2, string.substring(cur + 1, e - 1)];
    } else if (string[cur] === '\v') {
        value = [];
        let l = pos(string, cur, '\v\t\n');
        while (l != cur) {
            cur+=2;
            let val = getTypeParse(string, cur);
            cur = val[0];
            value.push(val[1]);
            l = pos(string, cur, '\v\t\n');
        }
        cur += 3;
        value = [cur, value];
    } else if (pos(string,cur,'START\n') === cur) {
        value = parseObj(string, cur);
    } else {
        let e = pos(string, cur, '\t\n');
        value = [e + 2, parseFloat(string.substring(cur, e))];
    }
    return value;
};

const parseObj = (string, cur) => {
    let obj = {};

    cur += 6;
    let l = pos(string, cur, '\t');
    let end = pos(string, cur, 'D\n');
    while (l < end && l !== 0) {
        let key = string.substring(cur, l);
        cur = l + 1;
        let tmp = getTypeParse(string, cur);
        cur = tmp[0];
        obj[key] = tmp[1];
        end = pos(string, cur, 'D\n');
        l = pos(string, cur, '\t');
    }
    cur = end + 2;
    return [cur, obj];
};
const parseVal = (string) => {};
module.exports = {
    stringify,
    parse
};
