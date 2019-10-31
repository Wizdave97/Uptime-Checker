const assert=require('assert');
const Queue=require('../lib/Queue');
const app={}
app.tests={}
app.queue=new Queue
app.runner=null
let suite;
class Test_Kit {
    constructor(val){
        this.val=val
    }
    
    toEqual(testVal){
        try{
            if(typeof this.val == 'object' && typeof testVal =='object'){
                assert.deepEqual(this.val,testVal)
            }
            else{
                assert.equal(this.val,testVal)
                
            }
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError){
                return {passed:false,error:err}
            }
        }

    }
    //Checks the length of  an Array
    toHaveLength(length){
        try{
            if(this.val instanceof Array || this.val instanceof String) assert.equal(this.val.length,length)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
        
    }
    //Asserts if an array or string contains a value
    toContain(value){
        try{
            if(this.val instanceof Array || this.val instanceof String) assert.equal(this.val.includes(value),true)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    notToEqual(testVal){
        try{
            if(typeof this.val == 'object' && typeof testVal =='object'){
                assert.notDeepEqual(this.val,testVal)
            }
            else{
                assert.notEqual(this.val,testVal)
                
            }
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError){
                return {passed:false,error:err}
            }
        }
    }
    //Checks the length of  an Array
    notToHaveLength(length){
        try{
            if(this.val instanceof Array || this.val instanceof String) assert.notEqual(this.val.length,length)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
        
    }
    //Greater Than
    toBeGreaterThan(testVal){
        try{
            assert(this.val>testVal)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    //Less Than
    toBeLessThan(testVal){
        try{
            assert(this.val<testVal)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    //Check If array
    toBeArray(){
        try{
            assert(this.val instanceof Array)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    //Assert if the actual value is a string
    toBeString(){
        try{
            assert(this.val instanceof String)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    //Asserts if an array or string contains a value
    notToContain(value){
        try{
            if(this.val instanceof Array || this.val instanceof String) assert.equal(this.val.includes(value),false)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    //Assert that a function does not throw an error
    doesNotThrow(){
        try{
            assert.doesNotThrow(this.val,TypeError)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    toBeFalse(){
        try{
            assert.ok(this.val,false)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    toBeTrue(){
        try{
            assert.equal(this.val,true)
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    toBeFalsy(){
        try{
            assert.ok(!Boolean(this.val))
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
    toBeTruthy(){
        try{
            assert.ok(Boolean(this.val))
            return {passed:true}
        }
        catch(err){
            if(err instanceof assert.AssertionError) return {passed:false,error:err}
        }
    }
}

const globals={
    // Creates a test suite
    describes:function(desc,callback){
        suite=desc
        app.tests[suite]={}
        callback(globals.done)
    },
    // Tests actual values, must be used inside  the callback of an 'it' function
    expect:function(actual){
        return new Test_Kit(actual)
    },
    // Creates a test Should be used inside a describe callback, each test must return an array of boolean values
    it:async function(test,callback){
        app.queue.enqueue(Math.random())
        try{
            app.tests[suite][test]=await callback()
        }
        catch(err){
            app.tests[suite][test]=err
        }
            
    },
    done:function(){
        app.queue.dequeue()
    },
    app
}

module.exports=globals