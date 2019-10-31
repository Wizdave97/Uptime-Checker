
//Setting the working environments
const fs=require('fs');
const path=require('path');
function injectEnvironmentVariables(){
    const baseDir=path.join(__dirname,'/../');
    const fileContent=fs.readFileSync(baseDir+'.env','utf8','r');
    if(typeof fileContent == 'string' && fileContent.trim().length>0){
        let lines=fileContent.split('\n')
        if(lines instanceof Array && lines.length>0){
            lines.forEach(line=>{
                if(typeof line == 'string' && line.trim().length>0){
                    let [envName,value]=line.trim().split('=')
                    if((typeof envName == 'string' && typeof value=='string') &&(envName.trim().length>0 && value.trim().length>0)){
                        process.env[envName.trim()]=value.trim()
                    }
                }
            })
        }
    }  
}
injectEnvironmentVariables()
const environments={
    development:{
        httpPort:3000,
        httpsPort:3001,
        envName:'development',
        hashSecret:'aBigSecret',
        maxChecks:5,
        twilio:{
            fromPhone:'+12054486196',
            authToken:process.env.TWILIO_AUTH_TOKEN,
            accountSid:process.env.TWILIO_ACCOUNT_SID
        },
        templateGlobals:{
            appName:'Uptime Checker',
            yearCreated:'2019',
            companyName:'NotYourRegularCompany, Inc.',
            baseUrl:'http:localhost:3000/'
        }
    },
    production:{
        httpPort:5000,
        httpsPort:5001,
        envName:'production',
        hashSecret:'aBigSecret',
        maxChecks:5,
        twilio:{
            fromPhone:'+12054486196',
            authToken:'48f5d0a735261f34a283db1b354180cb',
            accountSid:'ACe2afd6906bbc16268e0e09abdf45a59c'
        },
        templateGlobals:{
            appName:'Uptime Checker',
            yearCreated:'2019',
            companyName:'NotYourRegularCompany, Inc.',
            baseUrl:'http:localhost:5000/'
        }
    },
    testing:{
        httpPort:4000,
        httpsPort:4001,
        envName:'testing',
        hashSecret:'aBigSecret',
        maxChecks:5,
        twilio:{
            fromPhone:'+12054486196',
            authToken:'48f5d0a735261f34a283db1b354180cb',
            accountSid:'ACe2afd6906bbc16268e0e09abdf45a59c'
        },
        templateGlobals:{
            appName:'Uptime Checker',
            yearCreated:'2019',
            companyName:'NotYourRegularCompany, Inc.',
            baseUrl:'http:localhost:5000/'
        }
    }
}

let currentEnv=environments[process.env.NODE_ENV]?environments[process.env.NODE_ENV]:environments.development

module.exports=currentEnv