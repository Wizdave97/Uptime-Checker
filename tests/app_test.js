
//test function that returns 2
function getAnArray(){
    return [2,3,4,5]
}

describes('test for func getAnArray() ',function(done){
    it('it should have length 4 and not contain 8 ',()=>{
        done()
        return [
            expect(getAnArray()).toHaveLength(4),
            expect(getAnArray()).toContain(2)
        ]
    })
    it('it should contain 3 and 5',()=>{
        done()
        return [
            expect(getAnArray()).toContain(5),
            expect(getAnArray()).toContain(3)
        ]
    })
    
})