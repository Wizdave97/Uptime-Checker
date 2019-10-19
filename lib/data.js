//For storing and editing data
const fs=require('fs').promises
const { close }=require('fs')
const path=require('path')

//base directory of the .data folder

let baseDir=path.join(__dirname,'/../.data/')
module.exports={
    //Create a file
    create:function(dir,file,data){
        return new Promise((resolve,reject)=>{
            //Check is directory exists
        fs.stat(baseDir+dir).then(stat=>{
            if (stat.isDirectory()){
                //If directory exists open file
                fs.open(baseDir+dir+'/'+file+'.json','wx').then(file=>{
                  //Write JSON string to file
                  let JSONString=JSON.stringify(data)
                  fs.writeFile(file,JSONString).then(done=>{
                    file.close().then(()=>{
                        resolve(false)
                    }).catch(err=>{
                        reject(' Error closing file')
                    })
                  }).catch(err=>{
                      reject(' writing to file failed')
                  })
                }).catch(err=>{
                    reject(' File with that name already exists')
                })
            }
        }).catch(err=>{
            reject('Directory could not be found')
        })
        })
        
    },
    //Read JSON data from a file
    read:function(dir,file){
        return new Promise((resolve,reject)=>{
            fs.readFile(baseDir+dir+'/'+file+'.json','utf-8').then(data=>{
                resolve({status:false,data})
            }).catch(err=>{
                reject(err)
            })
        })
       
    },
    // Update an existing file with new data
    update:function(dir,fileName,data){
        return new Promise((resolve,reject)=>{
            fs.stat(baseDir+dir).then(stat=>{
                if (stat.isDirectory()){
                    //If directory exists open file
                    fs.open(baseDir+dir+'/'+fileName+'.json','r+').then(file=>{
                      //Write JSON string to file
                      let JSONString=JSON.stringify(data)
                      // Truncate File
                      fs.truncate(baseDir+dir+'/'+fileName+'.json').then(done=>{
                        fs.writeFile(file,JSONString).then(done=>{
                            file.close().then(()=>{
                                resolve(false)
                            }).catch(err=>{
                                reject('Error closing file')
                            })
                          }).catch(err=>{
                              reject('writing to file failed'+err)
                          })
                      }).catch(err=>{
                          reject('Error truncating file'+err)
                      })
                    }).catch(err=>{
                        reject('File doesn\'t exist')
                    })
                }
            }).catch(err=>{
                reject('Directory could not be found')
            })
        })
        
    } ,
    delete:function(dir,file){
        return new Promise((resolve,reject)=>{
            fs.unlink(baseDir+dir+'/'+file+'.json').then(done=>{
                resolve(false)
            }).catch(err=>{
                reject('Unable to delete, resource not found on this server')
            })
        })
        
    },
    list:function(dir){
        return new Promise((resolve,reject)=>{
            try{
                fs.stat(baseDir+dir.trim()+'/').then(stat=>{
                    if(stat.isDirectory()){
                        fs.readdir(baseDir+dir.trim()).then(dir=>{
                            let files=[]
                            dir.forEach(file=>{
                                files.push(file.replace('.json',''))
                            })
                            resolve(files)
                        }).catch(err=>{
                            reject('Could not read directory ',err)
                        })
                    }
                    else {
                        console.log('triggered here')
                        reject('directory doesn\'t exist')
                    }
                }).catch(err=>{
                    reject('directory doesn\'t exist')
                })
                
            }
            catch(err){
                reject(err)
            }
        })
    }
}