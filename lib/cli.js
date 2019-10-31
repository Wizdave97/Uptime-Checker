/*
*CLI LIBRARY
*
**/

/*
*Dependencies
*/
const readline=require('readline');
const util=require('util')
const debug=util.debuglog('cli');
const events=require('events');
const os=require('os');
const v8=require('v8');
const _data=require('./data');
const _logs=require('./logs');
const {parseJSON} = require('./helpers');
class _events extends events{};
const e=new _events();


// Instantiate CLI object
const cli={}
//Register Event Handlers
e.on('man',str=>{
    cli.responders.help()
})
e.on('help',str=>{
    cli.responders.help()
})
e.on('stats',str=>{
    cli.responders.stats()
})
e.on('list users',str=>{
    cli.responders.listUsers()
})
e.on('more user info',str=>{
    cli.responders.moreUserInfo(str)
})
e.on('list checks',str=>{
    cli.responders.listChecks(str)
})
e.on('more check info',str=>{
    cli.responders.moreCheckInfo(str)
})
e.on('list logs',str=>{
    cli.responders.listLogs()
})
e.on('more log info',str=>{
    cli.responders.moreLogInfo(str)
})
e.on('exit',()=>{
    cli.responders.exit()
})
//Responders object
cli.responders={}
cli.responders.help=()=>{
    const manual={
        'exit':'Kill the CLI and the entire application',
        'man':'Show this help Page',
        'help':'Alias to the "man" command',
        'stats':'Get the statistics of the underlying OS and the current resource utilization',
        'list users':'List all the active users in the system',
        'more user info --{phone}':'Gets more details of the user with the specified {phone} number',
        'list checks --up||down':'List of all the active checks in the system. Flags --up or --down are optional',
        'more check info --{checkId}':'Show more details of the check with the specified {checkId}',
        'list logs':'List all the logs in the system, compressed and uncompressed',
        'more log info --{fileName}':'Shows details of the log with the specified fileName',
        
    }
    //Set header and title
    cli.horizontalLine()
    cli.centeredText('CLI MANUAL')
    cli.horizontalLine()
    cli.verticalSpace(2)

    for(let key of Object.keys(manual)){
        if(manual.hasOwnProperty(key)){
            let value=manual[key];
            let line='\x1b[33m'+key+'\x1b[0m'
            let padding=60 - line.length
            for(let i=0;i<=padding;i++){
                line+=' '
            }
            line+='-'+value
            console.log(line)
            cli.verticalSpace(1)
        }

    }
    cli.horizontalLine()
}
//Utility Functions
//Creates Vertical space
cli.verticalSpace=(arg)=>{
    arg=typeof arg =='number' && Math.floor(arg)>0?Math.floor(arg):1
    if(arg){
        for(let i=0;i<arg;i++){
            console.log('\n')
        }
    }
}
//Creates a horizontal line across the screen
cli.horizontalLine=()=>{
    let width=process.stdout.columns;
    let line='';
    for(let i=0;i<width;i++){
        line+='-'
    }
    console.log(line)
}
cli.centeredText=(str)=>{
    str=typeof str =='string' && str.length>0?str:false
    if(str){
        let width=process.stdout.columns;
        let leftPadding=Math.floor((width-str.length)/2);
        let line='';
        for(let i=0;i<leftPadding;i++){
                line+=' '
        }
        line+=str
        console.log(line)
    }
    
}
cli.responders.stats=()=>{
    const stats={
        'Load Average':os.loadavg().join(' '),
        'CPU Count':os.cpus().length,
        'Free Memory':os.freemem()+' bytes',
        'Current Malloced Memory':v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory':v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap used (%)':Math.round((v8.getHeapStatistics().used_heap_size/v8.getHeapStatistics().total_heap_size)*100),
        'Available Heap Allocated (%)':Math.round((v8.getHeapStatistics().total_heap_size/v8.getHeapStatistics().heap_size_limit)*100),
        'Uptime':os.uptime()+' secs'
    }
    //Set header and title
    cli.horizontalLine()
    cli.centeredText('SYSTEM STATS')
    cli.horizontalLine()
    cli.verticalSpace(2)

    for(let key of Object.keys(stats)){
        if(stats.hasOwnProperty(key)){
            let value=stats[key];
            let line='\x1b[33m'+key+'\x1b[0m'
            let padding=60 - line.length
            for(let i=0;i<=padding;i++){
                line+=' '
            }
            line+='-'+value
            console.log(line)
            cli.verticalSpace(1)
        }

    }
    cli.horizontalLine()
}
cli.responders.listUsers=()=>{
    _data.list('users').then(users=>{
        if(typeof users=='object' && users instanceof Array && users.length>0 ){
            users.forEach(user=>{
                _data.read('users',user).then(({data})=>{
                    data=parseJSON(data)
                    data=typeof data=='object' && data!=null?data:false;
                    if(data){
                        let line='Name: '+data.firstName+' '+data.lastName+' Phone: '+data.phone+' Checks: '
                        let numOfChecks=typeof data.checks =='object' && data.checks instanceof Array && data.checks.length>0?data.checks.length:0;
                        line+=numOfChecks;
                        cli.verticalSpace();
                        console.log(line);
                    }
                }).catch(err=>{
                    cli.verticalSpace();
                    console.log(err)
                })
            })
        }
    }).catch(err=>{
        cli.verticalSpace()
        console.log(err)
    })
}
cli.responders.listChecks=(str)=>{
    _data.list('checks').then(checks=>{
        if(typeof checks=='object' && checks instanceof Array && checks.length>0 ){
            checks.forEach(check=>{
                _data.read('checks',check).then(({data})=>{
                    if(typeof data=='string' && data.length>0){
                        data=parseJSON(data)
                        data=typeof data=='object' && data!=null?data:false;
                        if(data){
                            let line='ID: '+data.id+' '+'URL: '+data.url+' '+' Method: '+data.method+' Protocol: '+data.protocol+' State: '
                            let state=data.state?data.state:'down'
                            line+=state
                            cli.verticalSpace();
                            console.log(line);
                        }
                    }
                    
                }).catch(err=>{
                    cli.verticalSpace();
                    console.log('');
                })
            })
        }
    }).catch(err=>{
        cli.verticalSpace()
        console.log('')
    })
}
cli.responders.listLogs=()=>{
    _logs.list(true).then(logs=>{
        logs=typeof logs =='object' && logs instanceof Array && logs.length>0?logs:false
        if(logs){
            cli.verticalSpace(1);
            console.log(logs.join('\n'))
        }
    }).catch(err=>{
        console.log('No Logs Found')
    })
}
cli.responders.moreUserInfo=(str)=>{
    let matchExp=/--(\w+)/g
    let match=str.match(matchExp)[0]
    if(typeof match=='string' && match.length>0){
        let userPhone=match.replace('--','');
        if(userPhone.length==11){
            _data.read('users',userPhone).then(({data})=>{
                if(typeof data== 'string' && data.length>0){
                    data=parseJSON(data);
                    data=typeof data =='object' && data!=null?data:false;
                    if(data){
                        let line='Name: '+data.firstName+' '+data.lastName+'\n'+'Phone: '+data.phone+'\n'+'Checks: \n';
                        let checks=typeof data.checks=='object' && data.checks instanceof Array && data.checks.length>0?data.checks.join('\n'):'No Checks Yet'
                        line+=checks
                        cli.verticalSpace(1);
                        console.log(line)
                    }
                }
            }).catch(err=>{
                cli.verticalSpace()
                console.log('User doesn\'t exist')
            })
        }
    }
}
cli.responders.moreCheckInfo=(str)=>{
    let matchExp=/--(\w+)/g
    let match=str.match(matchExp)[0]
    if(typeof match=='string' && match.length>0){
        let checkId=match.replace('--','');
        if(checkId.length==20){
            _data.read('checks',checkId).then(({data})=>{
                if(typeof data== 'string' && data.length>0){
                    data=parseJSON(data);
                    data=typeof data =='object' && data!=null?data:false;
                    if(data){
                        let line='Protocol: '+data.protocol+'\n'+'Url: '+data.url+'\n'+'Method: '+data.method+'\n'+'Success Codes: '+data.successCodes+'\n'+'Timeout seconds: '+data.timeoutSeconds+'\n';
                        let state=typeof data.state =='string' && data.state.length>0?'State: '+data.state+'\n':'State: down\n'
                        let lastChecked=typeof data.lastChecked =='number' && data.lastChecked>0?'Last Checked: '+new Date(data.lastChecked).toLocaleString()+'\n':'Last Checked: Never'
                        line+=state+lastChecked
                        cli.verticalSpace(1);
                        console.log(line)
                    }
                }
            }).catch(err=>{
                cli.verticalSpace()
                console.log('Check does not exist')
            })
        }
    }
}
cli.responders.moreLogInfo=(str)=>{
    let matchExp=/--(\w+)-\d+/g
    let match=str.match(matchExp)[0]
    
    if(typeof match=='string' && match.length>0){
        let logFileName=match.replace('--','')
        logFileName=logFileName.replace('.log','');
        logFileName=logFileName.replace('.gz.b64','');
        if(logFileName.length>0){
            _logs.decompress(logFileName).then(data=>{
                if(typeof data== 'string' && data.length>0){
                    cli.verticalSpace()
                    data=data.split('\n');
                    data.forEach(checkData=>{
                        if(typeof checkData =='string' && checkData.trim().length>1){
                            checkData=checkData.trim()
                            checkData=parseJSON(checkData.trim());
                            cli.verticalSpace(2);
                            console.log(checkData)
                        }

                    })
                }
            }).catch(err=>{
                cli.verticalSpace()
                console.log('Log File does not exist, please supply only names of compressed log files')
            })
        }
    }
}
cli.responders.exit=()=>{
    process.exit(0)
}
//Input Processor function
cli.processInput=(str)=>{
    str=typeof str == 'string' && str.trim().length>0?str.trim():false
    if(str){
        const uniqueStrings=[
            'man','help','stats','list users','more user info','list checks','more check info','list logs','more log info','exit'
        ]
        let matchFound=false;
        let counter=0;
        uniqueStrings.some((input)=>{
            if(str.toLowerCase().indexOf(input)>-1) {
                matchFound=true;
                //Emit an event
                e.emit(input,str)
                return true
            }
        })
        //If no match found give the user list of available commands
        if(!matchFound){
            console.log('Conmmand not found, list of available commands '+uniqueStrings.join('\n'))
        }
    }

}
cli.init=function(){
    //Send message to the console  to show CLI has started
    console.log('\x1b[34m%s\x1b[0m','CLI has started waiting for input')
    
    //Instantiate the prompt
    const _interface=readline.createInterface({
        input:process.stdin,
        output:process.stdout,
        prompt:'>>'
    })
    //Create the prompt
    _interface.prompt()

    //Handle the user input to the prompt
    _interface.on('line',str=>{
        //Send the input to the input processor
        cli.processInput(str)

        //Re-initialize the prompt
        _interface.prompt()
    })

    //Handle close event
    _interface.on('close',()=>{
        process.exit(0)
    })
}

module.exports=cli