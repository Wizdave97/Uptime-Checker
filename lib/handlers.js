/*
*Request Handlers
*/
//Exports
module.exports={
    notFound:function(req){
        return new Promise((resolve,reject)=>{
            try{
                resolve({status:404,body:'Resource not found on server'})
            }
            catch(err){
                reject(err)
            }
            
        })
    },
    ping:function(){
        return new Promise(resolve=>{
            resolve({status:200})
        })
    },
    exampleError:function(){
        return new Promise((resolve,reject)=>{
            let err=new Error('This my custom error')
            throw err
        })
    }
   }

