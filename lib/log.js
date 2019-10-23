/*
*
*Library for storing and rotating logs
*
*/


const path=require('path')
const fs=require('fs').promises
const zlib=require('zlib')

//Base Directory
const baseDir=path.join(__dirname,'/../.logs/');

log={
    append:function(logFilename,logString){
        return new Promise((resolve,reject)=>{
            try{
                fs.open(baseDir+logFilename+'.log','a').then(file=>{
                    file.appendFile(logString+'\n','utf8').then(val=>{
                        file.close().then(()=>{
                            resolve(false)
                        }).catch(err=>{
                            reject('Error closing file after appending')
                        })
                    }).catch(err=>{
                        
                        reject('Error Appending to file after opening')
                    })
                }).catch(err=>{
                    reject('Error opening log file')
                })
            }
            catch(err){
                reject(err)
                console.log('Error logging to file')
            }
        })
    },
    //List all .log files optionally include .gz files
    list:function(includeCompressedLogs){
        return new Promise((resolve,reject)=>{
            try{
                //Search for all log files
                fs.readdir(baseDir).then(logs=>{
                    //Resolve all files compressed and uncompressed
                    if(includeCompressedLogs) resolve(logs)
                    //Resolve only uncompressed logs
                    else{
                        let newLogs=logs.filter(log=>{
                            return log.endsWith('.log')
                        })
                        resolve(newLogs)
                    }
                }).catch(err=>{
                    reject('Could not find any log files')
                })

            }
            catch(err){
                reject(err)
            }

        })
    },
    //Compress .log files into .gz.b64 zipped files within the same directory
    compress:function(logId,newFileId){
        return new Promise((resolve,reject)=>{
            try{
                let sourceFile=logId+'.log',destinationFile=newFileId+'.gz.b64'
                fs.readFile(baseDir+sourceFile,'utf8').then(inputString=>{
                    zlib.gzip(inputString,function(err,buffer){
                        if(!err && buffer){
                            //Write the compressed data into the destination file
                            fs.open(baseDir+destinationFile,'wx').then(file=>{
                                file.writeFile(buffer.toString('base64')).then(status=>{
                                    file.close().then(()=>{
                                        resolve(false)
                                    }).catch(err=>{
                                        reject(err)
                                    })
                                }).catch(err=>{
                                    reject(err)
                                })
                            }).catch(err=>{
                                reject(err)
                            })
                        }
                        else{
                            reject(err)
                        }
                    })
                }).catch(err=>{
                    reject(err)
                })
            }
            catch(err){
                reject(err)
            }
        })
    },
    //Empty contents of log file after compressing
    truncate:function(logId){
        return new Promise((resolve,reject)=>{
            try{
                    fs.truncate(baseDir+logId+'.log',0).then(status=>{
                            resolve(false)
                    }).catch(err=>{
                        reject(err)
                    })
            }
            catch(err){
                reject(err)
            }
            
        })
    },
    //Decompress contents of a .gz.b64 file into a string variable
    decompress:function(file){
        return new Promise((resolve,reject)=>{
            try{
                let fileName=file+'.gz.b64';
                fs.readFile(baseDir+fileName,'utf8').then(str=>{
                    if(str){
                        let outputBuffer=Buffer.from(str,'base64')
                        zlib.unzip(outputBuffer,function(err,str){
                            if(!err && str){
                                let outputStr=str.toString()
                                resolve(outputStr)
                            }
                            else reject(err)
                        })
                    }
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

module.exports=log