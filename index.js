/*
*
*Entry file for application
*
*/

// Dependencies
const server=require('./lib/server.js')
const workers=require('./lib/workers')
const cli=require('./lib/cli')

const app={}

app.init=function(callback){

    //Start the Workers
    workers.init()
    
    //Start the Server
    server.init()
    setTimeout(()=>{
        cli.init()
        callback()
    },1000)
    
}

//Execute App
if(require.main === module){
    app.init(()=>{})
}
//Export module
module.exports=app
