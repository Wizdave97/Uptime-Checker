/*
*
*Entry file for application
*
*/

// Dependencies
const server=require('./lib/server.js')
const workers=require('./lib/workers')
const cli=require('./lib/cli')
const cluster=require('cluster')
const os=require('os')

const app={}

app.init=function(callback){

    if(cluster.isMaster){
        //Start the Workers
        workers.init()
        setTimeout(()=>{
            cli.init()
            callback()
        },1000)
        for(let i=0;i<os.cpus().length;i++){
            cluster.fork()
        }
    }
    else{
     
    //Start the Server
    server.init()
    
    }

    
}

//Execute App
if(require.main === module){
    app.init(()=>{})
}
//Export module
module.exports=app
