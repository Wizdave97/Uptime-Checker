const db=require('../db/mydb');

fs={

}

fs.readFile=function(dir,file){
    return new Promise((resolve,reject)=>{
        db[dir].get(file,(err,value)=>{
            if(err){
                error={code:'ENOENT',message:`Directory ${file} open not found`}
                reject(error)
            }
            else{
                resolve(value)
            }
        })
    })
}

fs.writeFile=function(dir,file,data){
    return new Promise((resolve,reject)=>{
        db[dir].put(file,data,(err)=>{
            if(err){
                error={code:'ENOENT',message:`Directory ${file} open not found`}
                reject(error)
            }
            else{
                resolve(false)
            }
        })
    })
}

fs.unlink=function(dir,file){
    return new Promise((resolve,reject)=>{
        db[dir].del(file,(err)=>{
            if(err){
                console.log(err)
                error={code:'ENOENT',message:`Directory ${file} open not found`}
                reject(error)
            }
            else{
                resolve(false)
            }
        })
    })
}

fs.readdir=function(dir){
    return new Promise((resolve,reject)=>{
        let keys=[]
        db[dir].createKeyStream().on('data',chunk=>{
            keys.push(chunk)
        }).on('end',()=>{
            resolve(keys)
        }).on('error',err=>{
            reject(err)
        })
    })
}

module.exports=fs