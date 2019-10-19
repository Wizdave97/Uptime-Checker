/*
*Container for frontend logic
*/

const app={}

app.toggleMenu=function(){
    
    let menu=document.getElementById('menu');
    menu.classList.toggle('menu-show');
}
app.config={
    token:false,
    expiresIn:false,
    phone:false,
    baseUrl:'http://localhost:3000/'
}
// Ajax Client for the restful API
app.client={

}

app.client.request=function(method,headers={'Content-Type':'application/json'},path,queryStringObject,payload){
    return new Promise((resolve,reject)=>{
        try{
            //Sanity checking the parameters
            headers=typeof headers =='object' && headers!=null?headers:{};
            path=typeof path =='string' && path.length>0?path:false;
            method=typeof method =='string' && method.length>0 && ['GET','POST','PUT','DELETE'].indexOf(method.toUpperCase().trim())>-1?method.toUpperCase().trim():false;
            queryStringObject=typeof queryStringObject =='object' && queryStringObject!=null?queryStringObject:{};
            payload=typeof payload =='object' && payload!=null?payload:{};
            if(path && payload && queryStringObject && headers && method){
                //Adding the Bearer token if it exists
                if(typeof app.config.token =='string' && app.config.token.trim().length==40){
                    headers.Authorization='Bearer'+app.config.token.trim();
                }
                //Appending the query string to the path url if its non-empty
                if(Object.keys(queryStringObject).length>0){
                    let counter=0;
                    for(let key in queryStringObject){
                        if(queryStringObject.hasOwnProperty(key) && typeof queryStringObject[key]=='string'){
                            if(counter>1){
                                path+='&'+key+'='+queryStringObject[key]
                                counter++
                            }
                            else{
                                path+='?'+key+'='+queryStringObject[key]
                                counter++
                            }
                        }
                    }
                }
                //Sending the request via fetch API
                fetch(app.config.baseUrl+path,{
                    headers:headers,
                    method:method,
                    'Content-Type':'application/json',
                    body:method!='GET'?JSON.stringify(payload):null
                }).then(res=>{
                    return new Promise((resolve)=>{
                        let status=res.status
                        if(status!=204){
                            res.json().then(res=>{
                                res.status=status
                                resolve(res)
                            }).catch(res=>{
                                res.status=status
                                reject(res)
                            })
                        }
                        else {
                            resolve({status:status})
                        }
                    })   
                }).then(res=>{
                    resolve(res)
                }).catch(err=>{
                    reject(err)
                })
            }
            else reject('invalid parameters')
        }
        catch(err){
            console.log(err)
        }
        
    })
}
app.client.storeSession=function(payload){
    if(typeof payload =='object'){
        let config={...app.config} 
        config.token=payload.token;
        config.expiresIn=payload.expiresIn;
        config.phone=payload.phone
        app.config={...config}
        localStorage.uptime=JSON.stringify(config)
    }
    else{
        let config={...app.config} 
        config.token=false;
        config.expiresIn=false;
        config.phone=false
        app.config={...config}
        localStorage.uptime=JSON.stringify(config)
    }

}
app.client.authCheckTimeout=function(){
    try{
        if(localStorage.uptime){
            let config=JSON.parse(localStorage.uptime)
            if(typeof config =='object' && typeof config.token=='string' && config.token.length==40){
                let tokenValidityPeriod=config.expiresIn-Date.now()
                setTimeout(()=>{
                    localStorage.uptime='';
                    let config={...app.config};
                    config.token=false;
                    config.expiresIn=false;
                    config.phone=false;
                    app.client.setClasses(false);
                    app.config=config;
                    location.pathname='/';
                },tokenValidityPeriod)
            }
            else return
        }
    }
    catch(err){
        console.log(err)
        app.client.setClasses(false); 
    }
}
app.client.setClasses=function(add){
    if(add){
        document.body.classList.add('logged-in')
        document.body.classList.remove('logged-out')
    }
    else{
        document.body.classList.remove('logged-in')
        document.body.classList.add('logged-out')
    }
}
app.client.autoLogIn=function(){
    try{
        if(localStorage.uptime){
            let config=JSON.parse(localStorage.uptime)
            if(typeof config =='object' && typeof config.token=='string' && config.token.length==40){
                let tokenValidityPeriod=config.expiresIn-Date.now()
                if(tokenValidityPeriod>-1){
                    app.client.setClasses(true);
                    app.client.authCheckTimeout();
                    app.client.storeSession(config);
                }
                else{
                    app.client.setClasses(false); 
                }
            }
            else {
                app.client.setClasses(false); 
            }
        }
        else{
            app.client.setClasses(false);  
        }
    }
    catch(err){
        console.log(err)
        app.client.setClasses(false); 
    }
    
}
app.client.logOut=function(){
    app.client.request('DELETE',null,'api/tokens',null,{token:app.config.token}).then(res=>{
        localStorage.uptime=''
        location.pathname='/'
    }).catch(err=>{
        console.log(err);
    })    
}
app.client.renderChecksTable=function(){
    app.client.request('GET',null,'api/checks/all',null,null).then(res=>{
        if(res.status==200){
            let tableBody=document.querySelector('tbody');
            console
            let checkData=typeof res.checkData =='object' && res.checkData.length>0?res.checkData:false
            if(checkData){ 
                if(tableBody){
                    let html='';
                    checkData.map((check,index)=>{
                        html+=`<tr>
                                <td>${index+1}</td>
                                <td>${check.userPhone}</td>
                                <td>${check.protocol}</td>
                                <td>${check.url}</td>
                                <td>${check.method}</td>
                                <td>${check.successCodes}</td>
                                <td>${check.timeoutSeconds}</td>
                                <td>${check.state?check.state:''}</td>
                                <td>${check.lastChecked?new Date(check.lastChecked).toLocaleString():''}</td>
                                <td><a class="action-button green" style="width:100%" href="checks/edit?${check.id}"><span>Edit</span></a></td>
                               </tr>`
                    })
                    tableBody.innerHTML=html;
                    //tableBody.insertAdjacentElement('afterbegin',html)
                }
            }
            else{
                if(tableBody){
                    tableBody.innerHTML='<tr><td colspan="8">You have no checks yet</td></tr>'
                }
            }
        }
    }).catch(err=>{
        console.log(err)
    })
}
// JS logic for signuppage
app.form={}
app.form.checkValidity=function(){
    let inputs=document.querySelectorAll('input');
    let isValid=true
    for(let input of Array.from(inputs)){
        let name=input.name
        if(input.checkValidity()){
            input.classList.remove('input-error')
            let span=document.getElementById(name+'-error');
            span.classList.remove('error-show');
        }
        else{
            input.classList.add('input-error')
            let span=document.getElementById(name+'-error');
            span.classList.add('error-show');
            isValid=false
        }
    }
    return isValid
}
//Process the response from the client request
app.form.processResponse=function(status,requestPayload,responsePayload){
    if(status==200 || status==204){
        location.pathname='checks/all'
        if(typeof responsePayload.token =='string')  {
            app.client.storeSession(responsePayload)
            app.client.autoLogIn();
            app.client.authCheckTimeout()
        }
    }
    else{
      if(responsePayload.error){
          let formError=document.getElementById('form-error')
          formError.innerHTML=''
          let span=document.createElement('span')
          span.textContent=responsePayload.error
          formError.insertAdjacentElement('afterbegin',span)
          formError.classList.add('form-error-show')
      }
      else{
          let formError=document.getElementById('form-error')
          formError.innerHTML=''
          let span=document.createElement('span')
          span.textContent='An network error occured, please try again'
          formError.insertAdjacentElement('afterbegin',span)
          formError.classList.add('form-error-show')
      }
  }
}
app.signUp={}
//Sign up submit form
app.signUp.submitForm=function(){
    let isValid=app.form.checkValidity()
    if(!isValid) return
    else{
        let inputs=document.querySelectorAll('input');
        const payload={}
        for(let input of Array.from(inputs)){
            let name=input.name
            if(input.type=='checkbox'){
                payload[name]=true
                continue
            }
            payload[name]=input.value
        }
        app.client.request('POST',null,'api/users',null,payload).then(res=>{
            location.pathname='session/create'
        }).catch(err=>{
            app.form.processResponse(err.status,null,err)
        })
    }
}
app.login={}
//Login Submit form
app.login.submitForm=function(){
    let isValid=app.form.checkValidity()
    if(!isValid) return
    else{
        let inputs=document.querySelectorAll('input');
        const payload={}
        for(let input of Array.from(inputs)){
            let name=input.name
            if(input.type=='checkbox'){
                payload[name]=true
                continue
            }
            payload[name]=input.value
        }
        app.client.request('POST',null,'api/tokens',null,payload).then(res=>{
            console.log(res)
            app.form.processResponse(res.status,null,res.tokenObject)
        }).catch(err=>{
            app.form.processResponse(err.status,null,err)
        })
    }
}
app.checks={}
app.checks.updateCheck=function(){
    let isValid=app.form.checkValidity()
    if(!isValid) return
    else{
        let inputs=document.querySelectorAll('input');
        const payload={}
        for(let input of Array.from(inputs)){
            let name=input.name
            if(name=='successCodes'){
                payload[name]=input.value.split(',')
                continue
            }
            if(name=='timeoutSeconds'){
                payload[name]=+input.value
                continue 
            }
            payload[name]=input.value
        }
        app.client.request('PUT',null,'api/checks',{id:location.search.slice(1)},payload).then(res=>{
            app.form.processResponse(res.status,null,res)
        }).catch(err=>{
            app.form.processResponse(err.status,null,err)
        })
    }
}
app.checks.createCheck=function(){
    let isValid=app.form.checkValidity()
    if(!isValid) return
    else{
        let inputs=document.querySelectorAll('input');
        const payload={}
        for(let input of Array.from(inputs)){
            let name=input.name
            if(name=='successCodes'){
                payload[name]=input.value.split(',')
                continue
            }
            if(name=='timeoutSeconds'){
                payload[name]=+input.value
                continue 
            }
            payload[name]=input.value
        }
        app.client.request('POST',null,'api/checks',null,payload).then(res=>{
            app.form.processResponse(res.status,null,res)
            
        }).catch(err=>{
            app.form.processResponse(err.status,null,err)
        })
    }
}
app.checks.deleteCheck=function(){
    app.client.request('DELETE',null,'api/checks',{id:location.search.slice(1)},null).then(res=>{
        location.pathname='checks/all'
    }).catch(err=>{
        app.form.processResponse(err.status,null,err)
    })
    
}

app.checks.renderCheck=function(){
    app.client.request('GET',null,'api/checks',{id:location.search.slice(1)},null).then(res=>{
        let data=res.data;
        let protocol=document.getElementById('protocol')
        let method=document.getElementById('method')
        let url=document.getElementById('url')
        let timeoutSeconds=document.getElementById('timeoutSeconds')
        let successCodes=document.getElementById('successCodes')
        protocol?protocol.value=data.protocol:false
        method?method.value=data.method:false
        url?url.value=data.url:false
        timeoutSeconds?timeoutSeconds.value=data.timeoutSeconds:false1
        successCodes?successCodes.value=data.successCodes.join(','):false
    }).catch(err=>{
        app.form.processResponse(err.status,null,err)
    })
}
app.account={}    
app.account.renderDetails=function(){
    app.client.request('GET',null,'api/users',{phone:app.config.phone},null).then(res=>{
        let data=res.data;
        let firstName=document.getElementById('firstname')
        let lastName=document.getElementById('lastname')
        let phone=document.getElementById('phone')
        let tosAgreement=document.getElementById('tos')

        firstName?firstName.value=data.firstName:false
        lastName?lastName.value=data.lastName:false
        phone?phone.value=data.phone:false
        tosAgreement?tosAgreement.checked=data.tosAgreement:false
    }).catch(err=>{
        app.form.processResponse(err.status,null,err)
    })
}
app.account.updateAccount=function(){
    let isValid=app.form.checkValidity()
    if(!isValid) return
    else{
        let inputs=document.querySelectorAll('input');
        const payload={}
        for(let input of Array.from(inputs)){
            let name=input.name
            if(name=='tosAgreement'){
                payload[name]=input.checked
                continue
            }
            payload[name]=input.value
        }
        app.client.request('PUT',null,'api/users',{id:app.config.phone},payload).then(res=>{
            app.form.processResponse(res.status,null,res)
        }).catch(err=>{
            app.form.processResponse(err.status,null,err)
        })
    }
}
app.account.deleteAccount=function(){
    app.client.request('DELETE',null,'api/users',{phone:app.config.phone},null).then(res=>{
        app.form.processResponse(res.status,null,res)
    }).catch(err=>{
        app.form.processResponse(err.status,null,err)
    })
    
}
app.bindForms=function(){
    let createAccount=document.getElementById('signup-form')
    let loginAccount=document.getElementById('login-form')
    let checkEdit=document.getElementById('editcheck-form')
    let checkDelete=document.getElementById('delete-check')
    let createCheck=document.getElementById('createcheck-form')
    let editAccount=document.getElementById('accountedit-form')
    if(createAccount){
        createAccount.addEventListener('submit',function(event){
            event.preventDefault()
            app.signUp.submitForm()
        })
    }
    if(loginAccount){
        loginAccount.addEventListener('submit',function(event){
            event.preventDefault();
            app.login.submitForm()
        })
    }
    if(checkEdit){
        checkEdit.addEventListener('submit',function(event){
            event.preventDefault()
            app.checks.updateCheck();
        })
    }
    if(createCheck){
        createCheck.addEventListener('submit',function(event){
            event.preventDefault()
            app.checks.createCheck();
        })
    }
    if(checkDelete){
        checkDelete.addEventListener('click',function(event){
            event.preventDefault();
            app.checks.deleteCheck();
        })
    }
    if(editAccount){
        editAccount.addEventListener('click',function(event){
            event.preventDefault();
            app.account.updateAccount();
        })
    }

}
app.init=function(){
    let menuIcon=document.getElementById('menu-icon');
    let logOut=document.getElementById('logout');
    if(logOut){
        logOut.onclick=app.client.logOut
    }
    menuIcon.onclick=app.toggleMenu
    app.bindForms();
    app.client.autoLogIn();
    if(location.pathname=='/checks/all'){
        app.client.renderChecksTable()
    }
    if(location.pathname=='/checks/edit' && document.getElementById('editcheck-form')){
        app.checks.renderCheck()
    }
    if(location.pathname=='/account/edit' && document.getElementById('accountedit-form')){
        app.account.renderDetails()
    }
}
window.addEventListener('DOMContentLoaded',function(){
    app.init()
})