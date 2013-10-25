describe("Object Monads Tests", function() {
    var testObject = {
        testValue: "test"
    };

    describe("Mo Tests", function() {
        it("Should work mGet a single value", function() {
            var result = mo(1);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("Should work mGet multiple values", function() {
            var result = mo(1,2,3,4);
            expect(result.value.length).toBe(4);
            expect(result.cont).toBe(true);
            expect(result.multArgs).toBe(true);
        });
    });

    describe("Ret Tests", function() {
        it("Should return the value stored in it", function() {
            expect(mo("value").mRet()).toBe("value");
        });


        it("Should return undefined but not error", function() {
            expect(mo().mRet()).toBeUndefined();
        });

        it("Should not execute mIf execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.mRet(function(o){ return o.testValue });
            expect(result.value).not.toBeUndefined();
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        });

        it("Should return an array mIf multivalue parameter is used", function() {
            var result = mo(1,2,3).mRet();
            expect(result.length).toBe(3);
        });
    });

    describe("Map Tests", function() {
        it("Should return the value requested", function() {
            var result = mo(testObject).mMap(function(obj) { return obj.testValue});
            expect(result.value).toBe("test");
        });

        it("Should return undefined but not error", function() {
            var result = mo(testObject).mMap(function(obj) { return obj.notTestValue});
            expect(result.value).toBeUndefined();
        });

        it("Should not execute mIf execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.mMap(function(o){ return o.testValue });
            expect(result.value).not.toBeUndefined();
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        })
    });

    describe("Do Tests", function() {

        var spy;
        beforeEach(function() {
            spy = jasmine.createSpy("dospy");
        });

        it("Should call the 'do' function mGet the value in the monad", function(){
            mo(testObject).mDo(spy);
            expect(spy).toHaveBeenCalledWith(testObject);
        });

        it("Should call the 'do' function mGet the list of arguments supplied", function() {
            mo(1,2,3,4).mDo(spy);
            expect(spy).toHaveBeenCalledWith(1,2,3,4);
        });

        it("Should not call the 'do' function mIf any of the argument list is undefined", function() {
            mo(1, 2, undefined, 3).mDo(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should not be called mIf monad should not continue", function(){
            var monad = mo(1);
            monad.cont = false;
            monad.mDo(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should maintain value even mIf it is not called", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mDo(spy);
            expect(spy).not.toHaveBeenCalled();
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });

        it("Should not call the 'do' function value in the monad is not defined", function(){
            mo(undefined).mDo(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should return the monad after executing the function", function(){
            var result = mo(testObject).mDo(spy);
            expect(spy).toHaveBeenCalledWith(testObject);
            expect(typeof result).toBe(typeof mo(testObject));
            expect(result.mRet()).toBe(mo(testObject).mRet());
        });
    });

    describe("With Tests", function() {
        it("Should return the value mIf it is a property on the object", function() {
            var result = mo(testObject).mGet("testValue").mRet();
            expect(result).toBe(testObject.testValue);
        });

        it("Should return an empty monad mIf it is not a property on the object", function() {
            var result = mo(testObject).mGet("badTestValue");
            expect(result.mRet()).toBe(mo().mRet());
        });

        it("Should not error mIf there is no property", function() {
            var result = mo(testObject)
                .mGet("badTestValue")
                .mGet("anotherBadValue")
                .mGet("moreBadValues");
            expect(result.mRet()).toBe(mo(undefined).mRet());
        });

        it("Should not execute mIf execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.mGet( "testValue" );
            expect(result.value).not.toBeUndefined();
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        })
    });

    describe("Recover Tests", function() {
        it("Should return the original value mIf it is defined", function() {
            var result = mo(testObject.testValue).mRecover("mRecover").mRet();
            expect(result).toBe(testObject.testValue);
        });

        it("Should return the supplied value mIf it is not defined", function() {
            var result = mo(undefined).mRecover("mRecover").mRet();
            expect(result).toBe("mRecover");
        });
    });

    describe("If tests", function() {
        it("continues execution mIf the condition object results in true", function() {
            var result = mo(1).mIf(true);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("continues execution mIf the condition function results in true", function() {
            var result = mo(1).mIf(function() { return true});
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("Returns the value and stops execution mIf the condition function results in false", function(){
            var result = mo(1).mIf(function() { return false });
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });

        it("Returns the value and stops execution mIf the condition object is false", function(){
            var result = mo(1).mIf(false);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });
    });

    describe("Else Tests", function() {
        it("Should restore execution and return the same value", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mElse();
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should stop execution mIf the execution has not previously been stopped", function() {
            var result = mo(1).mElse();
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);

            result = mo(1).mElse(true);
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);

            result = mo(1).mElse(function() { return true});
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });

        it("Should restore execution and return the same value mIf condition object is true", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mElse(true);
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should not restore execution but return the same value mIf condition object is false", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mElse(false);
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });

        it("Should restore execution and return the same value mIf condition function returns true", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mElse(function() { return true});
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should not restore execution but return the same value mIf condition function returns false", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.mElse(function() { return false});
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });
    });
});