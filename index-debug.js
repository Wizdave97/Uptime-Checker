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
    debugger;
    workers.init()
    
    //Start the Server
    debugger;
    server.init()
    setTimeout(()=>{
        debugger;
        cli.init()
    },2000)
    
}

//Execute App
app.init()

//Export module
module.exports=app