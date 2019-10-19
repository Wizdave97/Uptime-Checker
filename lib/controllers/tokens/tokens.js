/*
*Token API Handlers
*/

const __data=require('../../data')
const { hash,createRandomString,parseJSON}=require('../../helpers')

module.exports={
    postToken:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload)
                let hashedPassword,phone
                if(typeof payload.phone=='string' && payload.phone && /[0-9]/.test(payload.phone) && payload.phone.length==11 && !/[a-z]/gi.test(payload.phone)) phone=payload.phone.trim()
                if(typeof payload.password=='string' && payload.password.length>=8) {
                    hashedPassword=hash(payload.password.trim());
                }
                if(phone && hashedPassword ){
                    __data.read('users',phone).then(({status,data})=>{
                        data=JSON.parse(data)
                        if(hashedPassword==data.password){
                            let tokenObject=createRandomString(40)
                            tokenObject.phone=phone
                            __data.create('tokens',tokenObject.token,tokenObject).then(status=>{
                                resolve({body:JSON.stringify({tokenObject}),status:200})
                            }).catch(err=>{
                                reject({status:500,error:'Could not create user at this time'})
                            })
                        }
                        else reject({status:400,error:'Invalid Password'})
                    }).catch(err=>{
                        reject({status:500,error:'Invalid User'})
                    })
                }
                else reject({status:400,error:'Invalid Password or Phone'})  

            }
            catch(error){
                reject({error})
            }
        })
    },
    putToken:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload)
                let token=typeof payload.token=='string' && payload.token.length==40?payload.token:false
                let extend=typeof payload.extend=='boolean' && payload.extend?true:false
                if(token && extend){
                    __data.read('tokens',token).then(({status,data})=>{
                        if(data){
                            data=JSON.parse(data)
                            let tokenValidity=Date.now()<data.expiresIn
                            if(tokenValidity){
                                data.expiresIn=data.expiresIn+3600000
                                __data.update('tokens',token,data).then(status=>{
                                    resolve({status:200,body:JSON.stringify({data})})
                                }).catch(err=>{
                                    reject({status:500})
                                })
                            }
                            else reject({status:200,error:'Token expired cannot be extended'})
                        }
                    }).catch(err=>{
                        reject({status:400,error:'Invalid token'})
                    })
                }
                else{
                    reject({status:400,error:'Missing required fields token and extends'})
                }

            }
            catch(error){
                reject({error})
            }
        })
    },
    deleteToken:function(req) {
        // Delete token handler payload required token
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload)
                const { token } = payload
                __data.read('tokens',token).then(({status,data})=>{
                    __data.delete('tokens',token).then(status=>{
                        if(!status){
                            resolve({status:204})
                        }
                    }).catch(err=>{
                        reject({error:'Unable to delete token'})
                    })
                }).catch(err=>{
                    reject({error:err,status:400})
                })
            }
            catch(error){
                reject({error})
            }
        })
    },
    
}