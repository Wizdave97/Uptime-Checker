/*
*
*Entry file for application
*
*/

// Dependencies
const server=require('./lib/server.js')
const workers=require('./lib/workers')

const app={}

app.init=function(){

    //Start the Workers
    workers.init()
    
    //Start the Server
    server.init()

    
}

//Execute App
app.init()

//Export module
module.exports=app