
//Setting the working environments

const environments={
    development:{
        httpPort:3000,
        httpsPort:3001,
        envName:'development',
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
    }
}

let currentEnv=environments[process.env.NODE_ENV]?environments[process.env.NODE_ENV]:environments.development

module.exports=currentEnv