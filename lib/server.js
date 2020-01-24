

//Dependecies
const config=require('./config')
const http = require('http')
const https=require('https');
const url=require('url');
const { readFileSync }= require('fs')
const router=require('./routes')
const { notFound }=require('./handlers')
const StringDecoder=require('string_decoder').StringDecoder;
const { parseJSON }=require('./helpers');
const path=require('path')
const util=require('util')
const debug=util.debuglog('server');



//Start Servers http and https
const httpServer=http.createServer(function(req,res){
    serverHandler(req,res)
})

const httpsServerOptions={
    key:readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert:readFileSync(path.join(__dirname,'/../https/cert.pem'))
}

const httpsServer=https.createServer(httpsServerOptions,function(req,res){
    serverHandler(req,res)
})

httpServer.on('error',err=>{
    if(err.code=='EADDRINUSE'){
        httpServer.listen(config.httpPort++)
        console.clear()
        console.log('\x1b[35m%s\x1b[0m','httpServer listening on port:',config.httpPort++)
    }
})
httpsServer.on('error',err=>{
    if(err.code=='EADDRINUSE'){
        httpsServer.listen(config.httpsPort++)
        console.log('\x1b[36m%s\x1b[0m','httpsServer listening on port:',config.httpsPort++)
    }
})

// Server Handler
const serverHandler=(request,response)=>{
    let parsedUrl=url.parse(request.url,true) // parsing the url to create a url object, the true flag ensures it parses it with the query string

    let path=parsedUrl.pathname //path removing the domain and subdomain

    let trimmedPath=path.replace(/^\/+|\/+$/g,'') // removing trailing and leading slashes

    let method=request.method.toLowerCase() //Request method
    let defaultHeaders={'Content-Type':'application/json'} 
    let query=parsedUrl.query // pulling out the query string as an object
    
    //Get payload if any
    let buffer=''
    let decoder=new StringDecoder('utf-8')
    request.on('data',chunk=>buffer+=decoder.write(chunk))
    request.on('end',async ()=>{
        buffer+=decoder.end()
        let handler=await router.resolve(trimmedPath,method,request)||notFound
        // If the request is in the static library use the static handler
        if(trimmedPath.includes('static')){
            handler=await router.resolve('static',method,request) || notFound
        }
        let data={payload:buffer,query,...request,method,trimmedPath}
        handler(data).then(({body,status=200,headers=defaultHeaders})=>{
            response.writeHead(status,headers)
            if(body&&body.pipe) {
                body.pipe(response)
            }
            else response.end(body)
        }).catch(err=>{
            debug(err)
            if(typeof(err) =='object') {
                response.writeHead(err.status?err.status:500,defaultHeaders)
                response.end(JSON.stringify({...err,error:err.error?err.error:'An Unknown Error Occurred'}))
            }
            else {
                response.writeHead(500,defaultHeaders)
                response.end(JSON.stringify({error:'An unknown error occured'}))
            }
        })
    })
    
}

module.exports={
    init:function(){
            httpServer.listen(config.httpPort,config.serverIP)
            console.log('\x1b[35m%s\x1b[0m','httpServer listening on port:',config.httpPort)
            httpsServer.listen(config.httpsPort,config.serverIP)
            console.log('\x1b[36m%s\x1b[0m','httpsServer listening on port:',config.httpsPort)
    }
}
