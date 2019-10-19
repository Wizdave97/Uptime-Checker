const crypto=require('crypto');
const config=require('./config');
const __data=require('./data');
const https=require('https');
const querystring=require('querystring');
const fs=require('fs').promises;
const path=require('path')



const helpers={
    hash:function(str){
    try{
        if(typeof str=='string' && str.length>0){
            let hash=crypto.createHmac('sha256',config.hashSecret).update(str).digest('hex');
            return hash
        }
        return false
    }
    catch(err){
        console.log(err)
    } 

    },
    createRandomString:function(strLength){
        let possibleCharacters="ABCDEFGHIJKLmnopqrstuvwxyz6789abcdefghijklMNOPQRSTUVWXYZ012345";

        let token='';
        for(let i=1;i<=strLength;i++){
            token+=possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length))
        }
        let expiresIn=Date.now()+(1000*3600)
        return {token,expiresIn}
    },
    checkAuth:async function(req){
        try{
            let token=req.headers.authorization?req.headers.authorization.slice(6).trim():''
            if(token.length==40){
                try{
                    let { status, data}=await __data.read('tokens',token)
                    if(data){
                        data=JSON.parse(data)
                        let tokenValidity=Date.now()<data.expiresIn
                        if(tokenValidity){
                            req.authCredentials=data
                            return {status:true}
                        }
                        else{
                            return {status:false,error:'Token Expired already'}
                        }
                    }
                    return {status:false,error:''}
                }
                catch(err){
                    return {status:false,error:"Token doesn't exist"}  
                }  
            } 
            return {status:false,error:"Not Authorized Token not found"} 
        }
        catch(err){
            return {status:false,error:err} 
        }

    },
    createError:(path,method,error)=>()=>{
        return new Promise((resolve,reject)=>{
            reject({error:`error at ${path} with method ${method}: ${error}`,status:401})
        })
    },
    parseJSON:function(data){
        try{
            return JSON.parse(data)
        }
        catch(err){
            console.log(err)
        }
    },
    sendTwilioSms:function(phone,msg){
        return new Promise((resolve,reject)=>{
            //Validate the parameters
            try{
                phone=typeof phone=='string' && phone.trim().length==11?phone.trim():false
                msg=typeof msg=='string' && msg.trim().length>0 && msg.trim().length<=1600?msg.trim():false
                if(phone && msg){
                    //payload object
                    let payload={
                        From:config.twilio.fromPhone,
                        To:'+234'+phone.slice(1),
                        Body:msg
                    }
                    //stringify payload into x-www-form-urlencoded
                    let stringPayload=querystring.encode(payload)
                    // Create request details
                    let requestDetails={
                        protocol:'https:',
                        hostname:'api.twilio.com',
                        method:'POST',
                        path:'/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
                        auth:config.twilio.accountSid+':'+config.twilio.authToken,
                        headers:{
                            'Content-Type':'application/x-www-form-urlencoded',
                            'Content-Length':Buffer.byteLength(stringPayload),
                        }
                    }
                    //instantiate request object
                    let req=https.request(requestDetails,function(res){
                        //Grab the status of the response
                        let status=res.statusCode
                        if(status==200|| status==201){
                            resolve(true)
                        }
                        else{
                            resolve('Status code returned was, '+status)
                        }
                    })
                    //Bind req to an error event
                    req.on('error',(err)=>{
                        reject(err)
                    })
                    //write payload to request object
                    req.write(stringPayload)

                    //End the request to send it off
                    req.end()
                }
                else{
                    reject('Invalid Parameters')
                }
            }
            catch(err){
                console.log(err)
            }
            
        })
    },
    //Get the string Content of a template
    getTemplate:function(templateName,data){
        return new Promise((resolve,reject)=>{
            try{
                templateName=typeof templateName =='string' && templateName.length>0?templateName:false
                data=typeof data=='object' && data!=null?data:{}
                if(templateName){
                    const baseDir=path.join(__dirname,'/../public/templates/')
                    fs.readFile(baseDir+templateName+'.html','utf8').then(str=>{
                        let finalString=helpers.interpolate(str,data)
                        resolve(finalString)
                    }).catch(err=>{
                        reject('template supplied does not exist')
                    })
                }
                else{
                    reject('Invalid template name')
                }
            }
            catch(err){
                reject(err)
            }
        })
    },
    addUniversalTemplates:function(str,data){
        return new Promise((resolve,reject)=>{
            try{
                str=typeof str == 'string' && str.length>=0?str:'';
                data=typeof data == 'object' && data!=null?data:{};
                helpers.getTemplate('header',data).then(headerStr=>{
                    headerStr=helpers.interpolate(headerStr)
                    if(headerStr){
                        helpers.getTemplate('footer',data).then(footerStr=>{
                            footerStr=helpers.interpolate(footerStr);
                            if(footerStr){
                                let fullStr=headerStr+str+footerStr
                                resolve(fullStr)
                            }
                        }).catch(err=>{
                            reject('Error interpolating footer.html')
                        })
                    }
                }).catch(err=>{
                    reject('Error interpolating header.html')
                })
            }
            catch(err){
                reject(err)
            }
        })
    },
    interpolate:function(str,data){
        try{
            str=typeof str == 'string' && str.length>=0?str:'';
            data=typeof data == 'object' && data!=null?data:{};
            //find all the global keys in config
            for (let key in config.templateGlobals){
                if(config.templateGlobals.hasOwnProperty(key)) data['global.'+key]=config.templateGlobals[key]
            }
            let keys=Object.keys(data)
            for (let key of keys){
                if(data.hasOwnProperty(key) && typeof data[key] == 'string'){
                    let find='{'+key+'}';
                    let replace=data[key]
                    str=str.replace(find,replace)
                }
            }
            return str
        }
        catch(err){
            console.log(err)
        }
    },
    getStaticAssets:function(assetName){
        return new Promise((resolve,reject)=>{
            try{
                assetName=typeof assetName == 'string' && assetName.length>0?assetName:false
                if(assetName){
                    const baseDir=path.join(__dirname,'/../static/')
                    if(assetName.includes('.ico')||assetName.includes('.png')||assetName.includes('.jpg')){
                        fs.readFile(baseDir+assetName,'').then(str=>{
                            resolve(str)
                        }).catch(err=>{
                            reject(err)
                        })
                    }
                    else{
                        fs.readFile(baseDir+assetName,'utf-8').then(str=>{
                            resolve(str)
                        }).catch(err=>{
                            reject(err)
                        })
                    }

                }
            }
            catch(err){
                console.log(err)
                reject(err)
            }
            
        })
    },
    listChecks:function(){
        return new Promise((resolve,reject)=>{
            try{
                const baseDir=path.join(__dirname,'/../.data/checks/');
                fs.readdir(baseDir).then(checks=>{
                    let trimmedChecks=[]
                    if(checks.length==0) resolve(checks)
                    checks.forEach(check=>trimmedChecks.push(check.replace('.json','')))
                    resolve(trimmedChecks)
                }).catch(err=>{
                    
                    reject(err)
                })
            }
            catch(err){
                
                reject(err)
            }
        })
    }
}
module.exports=helpers