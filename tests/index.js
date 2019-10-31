

//test function that returns 2
function getANumber(){
    throw new TypeError
}

describes('Should not throw Error',function(done){
    it('should not throw an error',()=>{
        
        return [
            expect(getANumber).doesNotThrow()
        ]
    })
    done()
})