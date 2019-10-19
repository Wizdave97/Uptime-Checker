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
   }

