function mo(value) {
    var args = Array.prototype.slice.call(arguments);
    if(args.length > 1) {
        return new ObjMaybe(args, true);
    } else {
        return new ObjMaybe(value, false);
    }
}

var ObjMaybe = function(value, multipleArguments) {
    this.value = value;
    this.cont = true;
    this.multArgs = multipleArguments;
};

ObjMaybe.prototype.mDo = function(fn) {
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


ObjMaybe.prototype.mIf = function(condition) {
    if(!this.cont) {
        return this;
    }
    if(typeof condition === 'function'
        && (this.value == null || !condition(this.value))) {
            this.cont = false;
    } else if(this.value == null || !condition) {
        this.cont = false;
    }
    return this;
};

ObjMaybe.prototype.mGet = function(key) {
    if(!this.cont) {
        return this;
    }
    if(this.value != null && this.value[key] != null) {
        return mo(this.value[key]);
    } else {
        return mo();
    }
};

ObjMaybe.prototype.mRet = function(key) {
    if(!this.cont) {
        return this;
    }
    if(key && this.value != null) {
        return this.value[key];
    } else {
        return this.value;
    }
};

ObjMaybe.prototype.mMap = function(fn) {
    if(this.cont && this.value != null) {
        return mo(fn(this.value));
    } else {
        return this;
    }
};

ObjMaybe.prototype.mRecover = function(val) {
    if(this.value != null) {
        return this;
    } else {
        return mo(val);
    }
};

ObjMaybe.prototype.mElse = function(condition) {
    if(this.cont) {
        this.cont = false;
        return this;
    }

    this.cont = true;

    if(arguments.length === 0) {
        return this;
    } else {
        return this.mIf(condition)
    }
};

function amo(value) {
    return new ArrMaybe(value);
}

var ArrMaybe = function(value) {
    this.value = value;
    this.cont = true;
};

ArrMaybe.prototype.mDo = function(fn) {
    if(!this.cont){
        return this;
    }

    if(fn instanceof Function && this.value instanceof Array){
        for(var i = 0; i < this.value.length; i++) {
            fn(this.value[i]);
        }
    }

    return this;
};
