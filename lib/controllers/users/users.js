/*
*Users API Handlers
*/
const __data=require('../../data')
const { hash,parseJSON}=require('../../helpers')


module.exports={
    addUser:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload)
                let data={}
                let errors={}
                //required payload firstName, lastName, phone,password, tosAgreement
                if(typeof payload.firstName=='string' && payload.firstName && /\w+/g.test(payload.firstName)) data.firstName=payload.firstName.trim()
                else errors.firstName="firstName required as string"
                if(typeof payload.lastName=='string' && payload.lastName && /\w+/g.test(payload.lastName)) data.lastName=payload.lastName.trim()
                else errors.lastName="lastName is required as a string"
                if(typeof payload.phone=='string' && payload.phone && /[0-9]/.test(payload.phone) && payload.phone.length==11 && !/[a-z]/gi.test(payload.phone)) data.phone=payload.phone.trim()
                else errors.phone="phone is required and should be a string of digits with length of 11"
                if(typeof payload.password=='string' && payload.password.length>=8) {
                    let hashedPassword=hash(payload.password.trim());
                    if(hashedPassword) data.password=hashedPassword
                    else errors.password="password is required and must be min 8 characters"
                }
                else errors.password="password is required and must be min 8 characters"
                if( typeof payload.tosAgreement=='boolean' && payload.tosAgreement) data.tosAgreement=true
                else errors.tosAgreement="tosAgreement required and must be true boolean"
                let lengthOfErrors=Object.keys(errors).length
                if(lengthOfErrors>=1){
                    errors.status=400
                    reject(errors)
                }
                else if(lengthOfErrors==0){
                    __data.read('users',data.phone).then(({status,data})=>{
                        if(!status) {
                            reject({status:400,error:'Phone Number already exists on our server'})
                        }
                    }).catch(err=>{
                        __data.create('users',data.phone,data).then(status=>{
                            resolve({status:204})
                        }).catch(err=>{
                            reject({error:'Error Occured while creating record'+err})
                        })
                    })

                }  
                
                
            }
            catch(error){
                reject({error})
            }   
        })
    },
    //@TODO add authentication such that only authenticated users can fetch their data
    getUser:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let query=req.query
                if(typeof query.phone =='string' && query.phone.length==11){
                    __data.read('users',query.phone).then(({status,data})=>{
                        data=JSON.parse(data)
                        delete data.password
                        if(!status && typeof data=='object'){
                            resolve({body:JSON.stringify({data})})
                        }
                    }).catch(err=>{
                        reject({status:404,error:'User doesn\'t exist on this server'})
                    })
                }
                else{
                    reject({error:'Bad request, please check the documentation',status:400})
                }
            }
            catch(error){
                reject({error})
            }
        })
    },
    deleteUser:function(req){
        return new Promise((resolve,reject)=>{
            try{
                if(req.query.phone && req.query.phone.length==11){
                    __data.read('users',req.query.phone).then(({data})=>{
                        data=parseJSON(data)
                        let {checks}=data;
                        if(checks instanceof Array){
                            if(checks.length>0){
                                checks.forEach(async check=>{
                                    try{
                                        await __data.delete('checks',check)
                                    }
                                    catch(err){
                                        console.log(err)
                                    }
                                })
                            }
                        }
                        __data.delete('users',req.query.phone).then(status=>{
                            if(!status) {  
                                resolve({status:204})
                            }
                        }).catch(err=>{
                            reject({error:err})
                        })
                    }).catch(err=>{
                        reject({status:400,error:'User not found'})
                    })
                   
                }
            }
            catch(error){
                reject({error})
            }
        })
    },
    updateUser:function(req){
        return new Promise((resolve,reject)=>{
            try{
                let payload=parseJSON(req.payload)
                let data={}
                let errors={}
                if(typeof payload.firstName=='string' && payload.firstName && /\w+/g.test(payload.firstName)) data.firstName=payload.firstName.trim()
                else errors.firstName="firstName required as string"
                if(typeof payload.lastName=='string' && payload.lastName && /\w+/g.test(payload.lastName)) data.lastName=payload.lastName.trim()
                else errors.lastName="lastName is required as a string"
                if(typeof payload.phone=='string' && payload.phone && /[0-9]/.test(payload.phone) && payload.phone.length==11 && !/[a-z]/gi.test(payload.phone)) data.phone=payload.phone.trim()
                else errors.phone="phone is required and should be a string of digits with length of 11"
                if(typeof payload.password=='string' && payload.password.length>=8) {
                    let hashedPassword=hash(payload.password.trim());
                    if(hashedPassword) data.password=hashedPassword
                    else errors.password="password is required and must be min 8 characters"
                }
                else errors.password="password is required and must be min 8 characters"
                if( typeof payload.tosAgreement=='boolean' && payload.tosAgreement) data.tosAgreement=true
                else errors.tosAgreement="tosAgreement required and must be true boolean"
                let lengthOfErrors=Object.keys(errors).length
                if(lengthOfErrors>=1){
                    errors.status=400
                    reject({errors})
                }
                else if(lengthOfErrors==0){
                    __data.read('users',req.query.phone).then(({status,__})=>{
                        if(!status) {
                            __data.update('users',req.query.phone,data).then(status=>{
                                resolve({status:204})
                            }).catch(error=>{
                                reject({error})
                            })
                        }
                    }).catch(err=>{
                        console.log(err)
                        reject({status:400,error:'Phone Number already exists on our server'})
                    })

                }  

            }
            catch(error){
                reject({error})
            }
        })
    },
}