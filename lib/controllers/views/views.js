/*
*HTML handlers
*/

const { getTemplate,addUniversalTemplates,getStaticAssets}=require('../../helpers')
const zlib=require('zlib')

module.exports={

   index:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Welcome',
                    'head.description':'Uptime Monitoring App for your websites',
                    'body.title':'Uptime Monitoring',
                    'body.class':'index'
                }
                getTemplate('index',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
accountCreate:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Sign Up',
                    'head.description':'Create a new account on Uptime Checker',
                    'body.title':'Uptime Monitoring',
                    'body.class':'index',
                    'form.title':'Create Account'
                }
                getTemplate('signup',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
accountEdit:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Update Account',
                    'head.description':'Update your account on Uptime Checker',
                    'body.title':'Uptime Monitoring',
                    'body.class':'index',
                    'form.title':'Update Account'
                }
                getTemplate('account_edit',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
sessionCreate:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Login',
                    'head.description':'Login to your account on Uptime Checker',
                    'body.title':'Uptime Monitoring',
                    'body.class':'index',
                    'form.title':'Login to your account'
                }
                getTemplate('login',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
checksList:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Dashboard',
                    'head.description':'Monitor all the checks registered on this account',
                    'body.title':'Dashboard',
                    'body.class':'index',
                    'table.title':'Dashboard'
                }
                getTemplate('checks_list',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
checksEdit:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Modify Check',
                    'head.description':'Modify this check',
                    'body.title':'Modify Check',
                    'body.class':'index',
                    'form.title':'Modify Check'
                }
                getTemplate('checks_edit',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
checksCreate:function(req){
    return new Promise((resolve,reject)=>{
        try{
            if(req.method=='get'){
                let templateData={
                    'head.title':'Create Check',
                    'head.description':'Create a new check for monitoring',
                    'body.title':'Create Check',
                    'body.class':'index',
                    'form.title':'Create Check'
                }
                getTemplate('check_create',templateData).then(str=>{
                    addUniversalTemplates(str,templateData).then(fullString=>{
                        zlib.gzip(fullString,function(err,compressedStr){
                            if(!err && compressedStr){
                                resolve({status:200,body:compressedStr,headers:{'Content-Type':'text/html','Content-Encoding':'gzip'}})  
                            }
                            else{
                                reject(err)
                            }
                        })
                        
                    }).catch(err=>{
                        reject(err)
                    })  
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject({status:405})
            
        }
        catch(err){
            reject(err)
        }
    })
},
favicon:function(req){
    return new Promise((resolve,reject)=>{
        if(req.method=='get'){
            getStaticAssets('favicon.ico').then(data=>{
                zlib.gzip(data,function(err,outputData){
                    if(!err && outputData){
                        resolve({body:outputData,headers:{'Content-Type':'image/x-icon','Content-Encoding':'gzip'}})
                    }
                })
                
            }).catch(err=>{
                reject(err)
            })
        }
        else{
            reject({status:405})
        }
    })
},
serveStaticAssets:function(req){
    return new Promise((resolve,reject)=>{
        if(req.method=='get'){
            const {trimmedPath}=req
            let fileAssetName=trimmedPath.replace('static/','').trim();
            if(fileAssetName.length>0){
                getStaticAssets(fileAssetName).then(data=>{
                    //Determine the content-type ad default to (plain/text)
                    let contentType='plain/text';
                    if(fileAssetName.includes('.js')) contentType="text/javascript"
                    if(fileAssetName.includes('.css')) contentType="text/css"
                    if(fileAssetName.includes('.jpg')) contentType="image/jpeg"
                    if(fileAssetName.includes('.png')) contentType="image/png"
                    if(fileAssetName.includes('.ico')) contentType="image/x-icon"
                    if(fileAssetName.includes('.jpg') || fileAssetName.includes('.png') ){
                        resolve({body:data,headers:{'Content-Type':contentType}}) 
                    }
                    else{
                        zlib.gzip(data,function(err,outputData){
                            if(!err && outputData){
                                resolve({body:outputData,headers:{'Content-Type':contentType,'Content-Encoding':'gzip'}})
                            }
                            else reject(err)
                        })
                    }
                    
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject('Invalid Path')
        
        }
        else{
            reject({status:405})
        }
    })
},

}