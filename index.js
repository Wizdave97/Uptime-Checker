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

app.init=function(){

    //Start the Workers
    //workers.init()
    
    //Start the Server
    server.init()
    setTimeout(()=>{
        cli.init()
    },2000)
    
}

//Execute App
app.init()

//Export module
module.exports=app