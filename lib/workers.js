/*
* Worker related tasks
*
*/

const helpers=require('./helpers');
const __data=require('./data');
const url=require('url');
const http=require('http');
const https=require('https');
const __logs=require('./logs');
const util=require('util')
const debug=util.debuglog('workers');

workers={
    gatherAllChecks:async function(){
        try{
            let checks=await __data.list('checks')
            if(checks && checks.length>0){
                checks.forEach(async check=>{
                    //Read in the check data
                    let {data}=await __data.read('checks',check)
                    if(data && data.length>0){
                        workers.validateCheckData(data)
                    }
                    else{
                        debug('Error: No data found to read in check ('+check+')')
                    }
                })
            }
            else{
                debug('Error: could not find any checks to process')
            }
        }
        catch(err){
            debug(err)
        }
    },
    loop:function(){
        setInterval(()=>{
            workers.gatherAllChecks()
        },60000)
    },
    init:function(){
        //Log to the console in yellow
        console.log('\x1b[33m%s\x1b[0m','Background workers are running')
        //Execute all checks
        workers.gatherAllChecks()
        //Set a for loop to keep on executing checks
        workers.loop()
        //Compress all logs immediately
        workers.rotateLogs()
        //Call log compression loop
        workers.logRotationLoop()
    },
    validateCheckData:function(originalCheckData){
        originalCheckData=helpers.parseJSON(originalCheckData)
        originalCheckData.id=typeof originalCheckData.id =='string' && originalCheckData.id.length==20 ?originalCheckData.id:false
        originalCheckData.protocol=typeof originalCheckData.protocol =='string' && ['http','https'].indexOf(originalCheckData.protocol.trim())>-1?originalCheckData.protocol.trim():false
        originalCheckData.method=typeof originalCheckData.method =='string' && ['post','get','put','delete'].indexOf(originalCheckData.method.trim())>-1?originalCheckData.method.trim():false
        originalCheckData.url=typeof originalCheckData.url =='string' && originalCheckData.url.trim().length>0?originalCheckData.url:false
        originalCheckData.successCodes=originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length>0?originalCheckData.successCodes:false
        originalCheckData.timeoutSeconds=typeof originalCheckData.timeoutSeconds =='number' && originalCheckData.timeoutSeconds>0 && originalCheckData.timeoutSeconds<=5?originalCheckData.timeoutSeconds:false

        // Add State and last checked timeStamp

        originalCheckData.state=typeof originalCheckData.state =='string' && ['up','down'].indexOf(originalCheckData.state.trim())>-1?originalCheckData.state.trim():'down'
        originalCheckData.lastChecked=typeof originalCheckData.lastChecked=='number' && originalCheckData.lastChecked>0?originalCheckData.lastChecked:false
        // if all checks pass send it to the next function
        if(originalCheckData.id &&
            originalCheckData.protocol &&
            originalCheckData.method &&
            originalCheckData.url &&
            originalCheckData.successCodes &&
            originalCheckData.timeoutSeconds){
                workers.performCheck(originalCheckData)
            }
        else{
            debug('Error:  at least one check data is not valid, skipping this check')
        }
    },
    performCheck:function(originalCheckData){
        let checkOutcome={
            error:false,
            responseCode:false
        }
        let outcomeSent=false
        let parsedUrl=url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true)
        let hostName=parsedUrl.hostname
        let path=parsedUrl.path
        const requestDetails={
            protocol:originalCheckData.protocol+':',
            hostname:hostName,
            path:path,
            method:originalCheckData.method.toUpperCase(),
            timeout:originalCheckData.timeoutSeconds*1000
        }

        //instantiate request using http module or https module
        let __moduleToUse=originalCheckData.protocol=='http'?http:https
        let req=__moduleToUse.request(requestDetails,function(res){
            let statusCode=res.statusCode
            checkOutcome.responseCode=statusCode
            if(!outcomeSent){
                workers.processCheckOutcome(originalCheckData,checkOutcome)
                outcomeSent=true
            }
        })
        req.on('error',err=>{
            checkOutcome.error={
                error:true,
                value:err
            }
            if(!outcomeSent){
                workers.processCheckOutcome(originalCheckData,checkOutcome)
                outcomeSent=true
            }
        })
        req.on('timeout',err=>{
            checkOutcome.error={
                error:true,
                value:'timeout'
            }
            if(!outcomeSent){
                workers.processCheckOutcome(originalCheckData,checkOutcome)
                outcomeSent=true
            }
        })
        req.end()
    },
    processCheckOutcome:async function(originalCheckData,checkOutcome){
        try{
            let state=!checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode)>-1 ? 'up':'down'
            let alertWarranted=originalCheckData.state!=state?true:false
            let newCheckdata=originalCheckData
            newCheckdata.state=state;
            let timeOfCheck=Date.now()
            //logging check state
            workers.log(originalCheckData,checkOutcome,state,alertWarranted,timeOfCheck)
            newCheckdata.lastChecked=timeOfCheck
            let status=await __data.update('checks',newCheckdata.id,newCheckdata)
            
            if(!status){
                if(alertWarranted){
                    workers.alertStatusChanged(newCheckdata)
                }
                else debug('Check status has not changed')
            }
        }
        catch(err){
            debug('Error saving one of the checks ', err)
        }

    },
    alertStatusChanged:async function(newCheckdata){
        try{
            let msg='Your check for '+newCheckdata.method.toUpperCase()+' '+newCheckdata.protocol+'://'+newCheckdata.url+' has changed to '+newCheckdata.state
            let response=await helpers.sendTwilioSms(newCheckdata.userPhone,msg)
            if(typeof response=='boolean' && response) debug('Success: user alerted of status change of their check via sms')
            else debug('Could not send sms to alert user of their  check status change')
        }
        catch(err){
            debug(err)
        }
        
    },
    log:function(originalCheckData,checkOutcome,state,alertWarranted,timeOfCheck){
        //Form Log data
        let logData={
            check:originalCheckData,
            outcome:checkOutcome,
            state:state,
            alert:alertWarranted,
            time:timeOfCheck
        }
        //Convert logData to string
        let logString=JSON.stringify(logData)

        //Determine log file name
        let logFileName=originalCheckData.id

        //append to a file
        __logs.append(logFileName,logString).then(status=>{
            debug('Logging to file successful')
        }).catch(err=>{
            debug(err)
        })
    },
    rotateLogs:function(){
        return new Promise((resolve,reject)=>{
            try{
                 //List out all the uncompressed log files in the logs folder
                 __logs.list(false).then(logs=>{
                     logs.forEach(log=>{
                         let logId=log.replace('.log','')
                         let newFileId=logId+'-'+Date.now()
                         //Compress the file into a new file
                         __logs.compress(logId,newFileId).then(status=>{
                               
                            __logs.truncate(logId).then(status=>{
                               resolve(status)
                             }).catch(err=>{
                                 reject(err)
                             })
                         }).catch(err=>{
                             reject(err)
                         })
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
    //Timer to call log compression function every 24 hrs
    logRotationLoop:function(){
        setInterval(()=>{
            try{
                workers.rotateLogs().then(status=>{
                    debug(status)
                }).catch(err=>{
                    debug(err)
                })
            }
            catch(err){
                debug(err)
            }
        },24*60*60*1000)
    }

}
module.exports=workers