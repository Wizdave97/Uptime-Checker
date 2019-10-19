const Queue=require('./Queue');
const { createError }= require('./helpers');
const util=require('util')
const debug=util.debuglog('router');
class Router {
    constructor(){
        this.routes=[];
    }
    add(path,method,...handlers){
        try{
            path=path.toLowerCase()
            this.routes.push({path:path,method:method.toLowerCase(),handlers:handlers} )
        }
        catch(err){
            debug(err)
        }
       
    }
    async resolve(path,method,req){
        for(let route of this.routes){
            if(route.path==path && route.method==method) {
                let queue=new Queue()
                for(let func of route.handlers){
                    queue.enqueue(func)
                }
                while(!queue.isEmpty() && queue.size()>1){
                    let middleWare=queue.dequeue()
                    let {status,error}=await middleWare(req)
                    if(error) return createError(route.path,route.method,error)
                }
                return queue.dequeue()
            }
            continue
        }
        return null
    }
}

module.exports=Router