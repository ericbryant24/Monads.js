describe("Array Monad Tests", function() {
    describe("Amo Tests", function() {
        it("Should create a monad with array value", function() {
            var result = amo([1,2,3]);
            expect(result.value.length).toBe(3);
            expect(result.cont).toBe(true);
        });

        it("Should handle being passed an undefined value", function() {
            var result = amo();
            expect(result).not.toBeUndefined();
            expect(result.cont).toBe(true);
        });
    });

    describe("Do Tests", function() {
        var spy,
            arr = [1,2,3,4];
        beforeEach(function() {
            spy = jasmine.createSpy("dospy");
        });

        it("Should perform operation on every item in list", function() {
            var result = amo(arr).do(spy);
            expect(spy).toHaveBeenCalledWith(1);
            expect(spy).toHaveBeenCalledWith(2);
            expect(spy).toHaveBeenCalledWith(3);
            expect(spy).toHaveBeenCalledWith(4);
            expect(result.value).toBe(arr);
            expect(result.cont).toBe(true);
        });

        it("Should not perform operation if list is undefined", function() {
            var result = amo().do(spy);
            expect(spy).not.toHaveBeenCalled();
            expect(result.value).toBeUndefined();
            expect(result.cont).toBe(true);
        });

        it("Should not perform operation if list is empty", function() {
            var result = amo([]).do(spy);
            expect(spy).not.toHaveBeenCalled();
            expect(result.value).not.toBeUndefined();
            expect(result.value.length).toBe(0);
            expect(result.cont).toBe(true);
        });

        it("Should not perform operation if execution is stopped", function() {
            var monad = amo(arr);
            monad.cont = false;
            var result = monad.do(spy);
            expect(spy).not.toHaveBeenCalled();
            expect(result.value).toBe(arr);
            expect(result.cont).toBe(false);
        });
    });
});