const __logs=require('../lib/logs');
describes('Test for logs.list function',(done)=>{
    it('should return list of file names as an array',()=>{
        return new Promise((resolve,reject)=>{
            __logs.list(true).then(fileNames=>{
                resolve([
                    expect(fileNames.length).toBeGreaterThan(1),
                    expect(fileNames).toBeArray()
                ])
                done()
            }).catch(err=>{
                
                reject( [
                    expect(err).toBeString()
                ])
                done()
            })
        })
                    
    })
})

describes('Test for logs.truncate function',(done)=>{
    it('should return resolve to false and not throw on rejection',()=>{
        return new Promise((resolve,reject)=>{
            __logs.truncate('logId').then(status=>{
                resolve([
                    expect(status).toBeTrue(),
                ])
                done()
            }).catch(err=>{
                reject([expect(err).toBeTruthy()])
                done()
            })
        })
    })
})