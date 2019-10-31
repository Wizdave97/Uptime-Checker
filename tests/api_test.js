const my_app=require('../index');
const http=require('http');
const config=require('../lib/config');
function makeGetRequest(path){
    return new Promise((resolve)=>{
        const requestDetails={
            protocol:'http:',
            hostname:'localhost',
            path:path,
            port:config.httpPort,
            method:'GET',
            headers:{
                'Content-Type':'application/json'
            }
        }
        let req=http.request(requestDetails,(res)=>{
            resolve(res.statusCode)
        })
        req.end()
    })
    
}

describes('App should start without throwing',(done)=>{
    it('it should start without throwing',()=>{
        return [
            expect(()=>{my_app.init(done)}).doesNotThrow()
        ]
    })
 
})
describes('making a request to /ping should return a status code of 200',(done)=>{
    it('it should return a status code of 200',async()=>{
        const status=await makeGetRequest('/ping')
        done()
        return [
            expect(status).toEqual(200)
        ]
    })
 
})

describes('making a request without authorization to /users should return a status code of 401',(done)=>{
    it('it should return a status code of 401',async()=>{
        const status=await makeGetRequest('/api/users')
        done()
        return [
            expect(status).toEqual(401)
        ]
    })
 
})
describes('making a request to a non-existent path should return a status code of 404',(done)=>{
    it('it should return a status code of 404',async()=>{
        const status=await makeGetRequest('/should/not/exist')
        done()
        return [
            expect(status).toEqual(404)
        ]
    })
 
})