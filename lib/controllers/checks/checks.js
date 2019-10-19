/*
*Checks Handlers
*/

//Dependencies

const __data=require('../../data')
const { createRandomString,parseJSON,listChecks}=require('../../helpers')
const config =require('../../config')


module.exports={
     //Required data: protocol,timeoutSeconds,url,method,successCodes 
     postCheck:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload) 
                let error ={},data={}
                if(typeof payload.protocol=='string' && payload.protocol && ['http','https'].indexOf(payload.protocol.trim())>=0) data.protocol=payload.protocol.trim()
                else error.protocol="protocol required, either 'http' or 'https' "
                if(typeof payload.method=='string' && payload.method && ['get','post','put','delete'].indexOf(payload.method.trim())>=0) data.method=payload.method.trim()
                else error.method="method required, either 'get', 'post','put','delete' "
                if(typeof payload.url=='string' && payload.url && payload.url.trim().length>0 ) data.url=payload.url.trim()
                else error.url="url required "
                if(typeof payload.timeoutSeconds=='number' && payload.timeoutSeconds && payload.timeoutSeconds>=1 && payload.timeoutSeconds % 1 ==0 && payload.timeoutSeconds<=5 ) data.timeoutSeconds=payload.timeoutSeconds
                else error.timeoutSeconds="timeoutSeconds required, must be a number "
                if(typeof payload.successCodes=='object' && payload.successCodes instanceof Array && payload.successCodes.length>=1 ) data.successCodes=payload.successCodes
                else error.successCodes="timeoutSeconds required, must be a number "
                if(Object.keys(error).length==0){
                    let userPhone=req.authCredentials.phone
                    __data.read('users',userPhone).then(({data})=>{
                        data=parseJSON(data)
                        if(typeof data =='object'){
                            let userChecks=typeof data.checks == 'object' && data.checks instanceof Array ? data.checks:[]
                            if(userChecks && userChecks.length<config.maxChecks){
                                let checkId=createRandomString(20)
                                checkId=checkId.token
                                let checkObject={
                                    id:checkId,
                                    userPhone:userPhone,
                                    protocol:payload.protocol,
                                    url:payload.url,
                                    method:payload.method,
                                    successCodes:payload.successCodes,
                                    timeoutSeconds:payload.timeoutSeconds
                                }
                                __data.create('checks',checkId,checkObject).then(status=>{
                                    //Add the check Id to the user object
                                    userChecks.push(checkId)
                                    data.checks=userChecks
                                    __data.update('users',userPhone,data).then(status=>{
                                        resolve({body:JSON.stringify({checkObject})})
                                    }).catch(err=>{
                                        reject({error:'Could not update user checks'})
                                    })
                                }).catch(err=>{
                                    reject({error:'Unable to Create Check'})
                                })
                            }
                            else{
                                reject({status:403,error:'Reached maximum check limit ('+config.maxChecks+')'})
                            }
                        }
                    }).catch(error=>{
                        reject({error})
                    })
                }
                else{
                    reject({status:400,error:JSON.stringify(error)})
                }

            }
            catch(error){
                reject({error})
            }
        })
    },
    getCheck:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let {id}=req.query
                if(typeof id =='string' && id.length==20){
                let userPhone=req.authCredentials.phone
                __data.read('checks',id).then(({data})=>{
                    data=parseJSON(data);
                    if(data.userPhone==userPhone) resolve({body:JSON.stringify({data})})
                    else reject({status:403,error:"Invalid checkId for User"})
                }).catch(err=>{
                    reject({status:404,error:'Check doesn\'t exist on this server'})
                })
             }
             else reject({status:400,error:'invalid query params (id)'})
            }
            catch(error){
                reject({error})
            }
        })
    },
    getAllChecks:function(req){
        return new Promise((resolve,reject)=>{
            try{
                listChecks().then(async checks=>{
                    let checkData=[]
                    let count=0;
                    let userPhone=req.authCredentials.phone
                    if(checks.length==0) resolve({status:200,body:JSON.stringify({checkData})})
                    checks.forEach((check,index)=>{
                         __data.read('checks',check).then(({data})=>{
                            count++
                            if(typeof data=='string' && data.length>0) data=parseJSON(data)
                            data=typeof data =='object'?data:false
                            if(data){
                                if(data.userPhone==userPhone) checkData.push(data)  
                            }
                            if(count == checks.length)  {
                                resolve({status:200,body:JSON.stringify({checkData})})
                            }
                         }).catch(err=>{
                             reject({status:500,error:'Unable to read data'})
                         })

                    })
                    
                      
                }).catch(err=>{
                    console.log(err)
                    reject({status:500,error:'Could not reach database at the moment'})
                })
            }
            catch(error){
                reject({error})
            }
        })
    },
    putCheck:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let {id}=req.query;
                if(typeof id =='string' && id.length==20){
                    let payload=parseJSON(req.payload)
                    let userPhone=req.authCredentials.phone
                    let error ={},newData={}
                    if(payload.protocol){
                        if(typeof payload.protocol=='string' && payload.protocol && ['http','https'].indexOf(payload.protocol.trim())>=0) newData.protocol=payload.protocol.trim()
                        else error.protocol="protocol required, either 'http' or 'https' "
                    }
                    if(payload.method){
                        if(typeof payload.method=='string' && payload.method && ['get','post','put','delete'].indexOf(payload.method.trim())>=0) newData.method=payload.method.trim()
                        else error.method="method required, either 'get', 'post','put','delete' "
                    }
                    if(payload.url){
                        if(typeof payload.url=='string' && payload.url && payload.url.trim().length>0) newData.url=payload.url.trim()
                        else error.url="url required "
                    }
                    if(payload.timeoutSeconds){
                        if(typeof payload.timeoutSeconds=='number' && payload.timeoutSeconds && payload.timeoutSeconds>=1 && payload.timeoutSeconds % 1 ==0 && payload.timeoutSeconds<=5 ) newData.timeoutSeconds=payload.timeoutSeconds
                        else error.timeoutSeconds="timeoutSeconds required, must be a number "
                    }
                    if(payload.successCodes){
                        if(typeof payload.successCodes=='object' && payload.successCodes instanceof Array && payload.successCodes.length>=1 ) newData.successCodes=payload.successCodes
                        else error.successCodes="At least one success code required "
                    }
                    if(Object.keys(error).length==0 && Object.keys(newData).length>0){
                        __data.read('checks',id).then(({data})=>{
                            data=parseJSON(data)
                            if(data.userPhone==userPhone){
                                newData={...data,...newData}
                                __data.update('checks',id,newData).then(status=>{
                                    resolve({status:204})
                                }).catch(err=>{
                                    reject({status:500,error:'could not update check'})
                                })
                            }
                        }).catch(err=>{
                            reject({status:404,error:'invalid id, check doesn\'t exist'})
                        })
                    }
                    else reject({status:400,error:JSON.stringify(error)})
                    }
                else reject({status:400,error:'invalid query params (id)'})
            }
           catch(error){
               reject({error})
           }
        })
    },
    deleteCheck:function(req){
        return new Promise((resolve,reject)=>{
        try{
            let { id }=req.query
            if(typeof id=='string' && id.length==20){
                let userPhone=req.authCredentials.phone
                __data.read('checks',id).then(({data})=>{
                    data=parseJSON(data)
                    if(data.userPhone==userPhone){
                        __data.delete('checks',id).then(status=>{
                            __data.read('users',userPhone).then(({data})=>{
                                data=parseJSON(data);
                                let checkIndex=data.checks.indexOf(id)
                                if(checkIndex>-1){
                                    data.checks.splice(checkIndex,1)
                                __data.update('users',userPhone,data).then(status=>{
                                    resolve({status:204})
                                }).catch(err=>{
                                    reject({status:500,error:'Error updating user checks'})
                                })
                                }
                                else {
                                    reject({status:500,error:'check Id not found in list of user defined checks'}) 
                                }
                            }).catch(err=>{
                                reject({status:500,error:'Error reading user checks'})
                            })
                            
                        }).catch(err=>{
                            reject({status:500,error:'Could not delete check'})
                        })
                    }
                }).catch(err=>{
                    reject({status:400,error:"Invalid check id"})
                })
            }
            else reject({status:400,error:'invalid query params (id)'})
        }
        catch(error){
            reject({error})
        }
            
        })
    }

}