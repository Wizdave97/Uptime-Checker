//For storing and editing data

const fs=require('./fs-adapter');
const path=require('path')

//base directory of the .data folder

let baseDir=path.join(__dirname,'/../.data/')
module.exports={
    //Create a file
    create:function(dir,file,data){
        return new Promise((resolve,reject)=>{
            let JSONString=JSON.stringify(data)
            fs.writeFile(dir,path.join(baseDir,dir+'/'+file+'.json'),JSONString).then(done=>{
                  resolve(false)
            }).catch(err=>{
                reject(' writing to file failed')
            })
                
        })
        
    },
    //Read JSON data from a file
    read:function(dir,file){
        return new Promise((resolve,reject)=>{
            fs.readFile(dir,path.join(baseDir,dir+'/'+file+'.json')).then(data=>{
                resolve({status:false,data})
            }).catch(err=>{
                reject(err)
            })
        })
       
    },
    // Update an existing file with new data
    update:function(dir,fileName,data){
        return new Promise((resolve,reject)=>{
             let JSONString=JSON.stringify(data)
               fs.writeFile(dir,path.join(baseDir,dir+'/'+fileName+'.json'),JSONString).then(done=>{
                   resolve(false)
                 }).catch(err=>{
                     reject('writing to file failed'+err)
                 })            
        })  
    } ,
    delete:function(dir,file){
        return new Promise((resolve,reject)=>{
            fs.unlink(dir,path.join(baseDir,dir+'/'+file+'.json')).then(done=>{
                resolve(false)
            }).catch(err=>{
                reject('Unable to delete, resource not found on this server')
            })
        })
        
    },
    list:function(dir){
        return new Promise((resolve,reject)=>{
            try{
                fs.readdir(dir).then(dir=>{
                    let files=[]
                    dir.forEach(file=>{
                        files.push(file.replace('.json',''))
                    })
                    resolve(files)
                }).catch(err=>{
                    reject('Could not read directory ',err)
                })
                    
                
            }
            catch(err){
                reject(err)
            }
        })
    }
}