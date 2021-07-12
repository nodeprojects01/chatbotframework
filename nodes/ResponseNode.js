
class PlainText {
    constructor(type) {
        this.type = type
    }

    message(msg) {
        return {
            type: this.type,
            message: msg
        };
    }
}

class QuickReplies extends PlainText {
    constructor(type) {
        super(type);
    }

    message(msg, options) {
        return {
            type: this.type,
            message: msg,
            options: options
        };
    }
}

class VerticalButtons extends PlainText {
    constructor(type) {
        super(type);
    }

    message(msg, options) {
        return {
            type: this.type,
            message: msg,
            options: options
        };
    }
}

class Carousel extends VerticalButtons {
    constructor(type) {
        super(type);
    }

    message(msg, options) {
        return {
            type: this.type,
            message: msg,
            options: options
        };
    }
}

const responseTypes = {
    plainText: "PlainText",
    quickReplies: "QuickReplies",
    verticalButtons: "VerticalButtons",
    carousel: "Carousel"
}

function response(type) {
    try {
        if (type in responseTypes) {
            _type = responseTypes[type];
            switch (_type) {
                case "PlainText":
                    return new PlainText(_type);
                case "QuickReplies":
                    return new QuickReplies(_type);
                case "VerticalButtons":
                    return new VerticalButtons(_type);
                case "Carousel":
                    return new Carousel(_type);
            }
        }
        else {
            throw new Error("Invalid respose type");
        }
    }
    catch (e) {
        return e;
    }
}

module.exports = { response, responseTypes };

// resp = response("verticalButtons");
// console.log(resp.message("I can help you with below options", ["timesheet", "payslip"]));
