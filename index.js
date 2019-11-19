/*
*
*Entry file for application
*
*/

// Dependencies
const server=require('./lib/server.js')
const workers=require('./lib/workers')
const cli=require('./lib/cli')
const db=require('./db/mydb');

const app={}

app.init=function(callback){
    if(db.tokens && db.checks && db.users){
        //Start the Workers
        workers.init()

        //Start the Server
        server.init()
        setTimeout(()=>{
            cli.init()
            callback()
        },1000)
 
    }
    else{
        setTimeout(()=>{
            app.init()
        },200)
    }
   
}

//Execute App
if(require.main === module){
    app.init(()=>{})
}
//Export module
module.exports=app
