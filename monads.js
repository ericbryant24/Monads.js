function mo(value) {
    if(typeof value === 'array'){
        return new ArrMaybe(value)
    } else {
        var args = Array.prototype.slice.call(arguments);
        if(args.length > 1) {
            return new ObjMaybe(args, true);
        } else {
            return new ObjMaybe(value, false);
        }
    }
}

var ArrMaybe = function(value) {
    this.value = value;
};

var ObjMaybe = function(value, multipleArguments) {
    this.value = value;
    this.cont = true;
    this.multArgs = multipleArguments;
};

ObjMaybe.prototype.do = function(fn) {
    if(this.cont && this.value != null) {
        if(this.multArgs){
            var isValid = this.value.indexOf(undefined) == -1
                && this.value.indexOf(null) == -1;
            if(isValid) {
                fn.apply(this, this.value);
            }
        } else {
            fn(this.value);
        }
    }
    return this;
};


ObjMaybe.prototype.if = function(condition) {
    if(typeof condition === 'function'
        && (!this.cont && this.value == null
        || !condition(this.value))) {
            this.cont = false;
    } else if(!this.cont || this.value == null || !condition) {
        this.cont = false;
    }
    return this;
};

ObjMaybe.prototype.with = function(key) {
    if(!this.cont) {
        return this;
    }
    if(this.value != null && this.value[key] != null) {
        return mo(this.value[key]);
    } else {
        return mo();
    }
};

ObjMaybe.prototype.ret = function(key) {
    if(!this.cont) {
        return this;
    }
    if(key) {
        if(this.value != null) {
            return this.value[key];
        }
    } else {
        return this.value;
    }
};

ObjMaybe.prototype.map = function(fn) {
    if(this.cont && this.value != null) {
        return mo(fn(this.value));
    } else {
        return this;
    }
};

ObjMaybe.prototype.recover = function(val) {
    if(this.value != null) {
        return this;
    } else {
        return mo(val);
    }
};

ObjMaybe.prototype.else = function(condition) {
    if(this.cont) {
        this.cont = false;
        return this;
    }

    this.cont = true;
    if(arguments.length === 0) {
        return this;
    } else {
        return this.if(condition)
    }
}

