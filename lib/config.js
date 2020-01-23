

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
        httpPort:process.env.PORT,
        httpsPort:process.env.PORT,
        envName:'production',
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
            baseUrl:'http://uptime-checker-uptime-ff6d3b531.apps.us-east-2.starter.openshift-online.com'
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
            authToken:process.env.TWILIO_AUTH_TOKEN,
            accountSid:process.env.TWILIO_ACCOUNT_SID
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
