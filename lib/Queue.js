class Queue{
    constructor(){
        this.data=[]
    }
    enqueue(elem){
        this.data.push(elem)
    }
    dequeue(){
        return this.data.splice(0,1)[0]
    }
    
    isEmpty(){
        return this.data.length>0?false:true
    }
    size(){
        return this.data.length
    }
}
module.exports=Queue