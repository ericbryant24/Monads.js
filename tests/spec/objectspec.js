describe("Object Monads Tests", function() {
    var testObject = {
        testValue: "test"
    };

    describe("Mo Tests", function() {
        it("Should work with a single value", function() {
            var result = mo(1);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("Should work with multiple values", function() {
            var result = mo(1,2,3,4);
            expect(result.value.length).toBe(4);
            expect(result.cont).toBe(true);
            expect(result.multArgs).toBe(true);
        });
    });

    describe("Ret Tests", function() {
        it("Should return the value stored in it", function() {
            expect(mo("value").ret()).toBe("value");
        });


        it("Should return undefined but not error", function() {
            expect(mo().ret()).toBeUndefined();
        });

        it("Should not execute if execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.ret(function(o){ return o.testValue });
            expect(result.value).not.toBeUndefined()
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        })
    });

    describe("Map Tests", function() {
        it("Should return the value requested", function() {
            var result = mo(testObject).map(function(obj) { return obj.testValue});
            expect(result.value).toBe("test");
        });

        it("Should return undefined but not error", function() {
            var result = mo(testObject).map(function(obj) { return obj.notTestValue});
            expect(result.value).toBeUndefined();
        });

        it("Should not execute if execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.map(function(o){ return o.testValue });
            expect(result.value).not.toBeUndefined()
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        })
    });

    describe("Do Tests", function() {

        var spy;
        beforeEach(function() {
            spy = jasmine.createSpy("dospy");
        })

        it("Should call the 'do' function with the value in the monad", function(){
            mo(testObject).do(spy);
            expect(spy).toHaveBeenCalledWith(testObject);
        });

        it("Should call the 'do' function with the list of arguments supplied", function() {
            mo(1,2,3,4).do(spy);
            expect(spy).toHaveBeenCalledWith(1,2,3,4);
        });

        it("Should not call the 'do' function if any of the argument list is undefined", function() {
            mo(1, 2, undefined, 3).do(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should not be called if monad should not continue", function(){
            var monad = mo(1);
            monad.cont = false;
            monad.do(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should maintain value even if it is not called", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.do(spy);
            expect(spy).not.toHaveBeenCalled();
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });

        it("Should not call the 'do' function value in the monad is not defined", function(){
            mo(undefined).do(spy);
            expect(spy).not.toHaveBeenCalled();
        });

        it("Should return the monad after executing the function", function(){
            var result = mo(testObject).do(spy);
            expect(spy).toHaveBeenCalledWith(testObject);
            expect(typeof result).toBe(typeof mo(testObject));
            expect(result.ret()).toBe(mo(testObject).ret());
        });
    });

    describe("With Tests", function() {
        it("Should return the value if it is a property on the object", function() {
            var result = mo(testObject).with("testValue").ret();
            expect(result).toBe(testObject.testValue);
        });

        it("Should return an empty monad if it is not a property on the object", function() {
            var result = mo(testObject).with("badTestValue");
            expect(result.ret()).toBe(mo().ret());
        });

        it("Should not error if there is no property", function() {
            var result = mo(testObject)
                .with("badTestValue")
                .with("anotherBadValue")
                .with("moreBadValues");
            expect(result.ret()).toBe(mo(undefined).ret());
        });

        it("Should not execute if execution is stopped", function() {
            var monad = mo(testObject);
            monad.cont = false;
            var result = monad.with( "testValue" );
            expect(result.value).not.toBeUndefined()
            expect(result.cont).toBe(false);
            expect(result.value).not.toBe(testObject.testValue);
        })
    });

    describe("Recover Tests", function() {
        it("Should return the original value if it is defined", function() {
            var result = mo(testObject.testValue).recover("recover").ret();
            expect(result).toBe(testObject.testValue);
        });

        it("Should return the supplied value if it is not defined", function() {
            var result = mo(undefined).recover("recover").ret();
            expect(result).toBe("recover");
        });
    });

    describe("If tests", function() {
        it("continues execution if the condition object results in true", function() {
            var result = mo(1).if(true);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("continues execution if the condition function results in true", function() {
            var result = mo(1).if(function() { return true});
            expect(result.value).toBe(1);
            expect(result.cont).toBe(true);
        });

        it("Returns the value and stops execution if the condition function results in false", function(){
            var result = mo(1).if(function() { return false });
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });

        it("Returns the value and stops execution if the condition object is false", function(){
            var result = mo(1).if(false);
            expect(result.value).toBe(1);
            expect(result.cont).toBe(false);
        });
    });

    describe("Else Tests", function() {
        it("Should restore execution and return the same value", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.else();
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should stop execution if the execution has not previously been stopped", function() {
            var result = mo(1).else();
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);

            var result = mo(1).else(true);
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);

            var result = mo(1).else(function() { return true});
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });

        it("Should restore execution and return the same value if condition object is true", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.else(true);
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should not restore execution but return the same value if condition object is false", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.else(false);
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });

        it("Should restore execution and return the same value if condition function returns true", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.else(function() { return true});
            expect(result.cont).toBe(true);
            expect(result.value).toBe(1);
        });

        it("Should not restore execution but return the same value if condition function returns false", function() {
            var monad = mo(1);
            monad.cont = false;
            var result = monad.else(function() { return false});
            expect(result.cont).toBe(false);
            expect(result.value).toBe(1);
        });
    });
});