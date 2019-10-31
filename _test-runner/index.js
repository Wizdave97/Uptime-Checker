process.env.NODE_ENV='testing';
const {it,describes,expect,app,}=require('./test_framework');
const path=require('path');
const fs=require('fs').promises;
const baseDir=path.join(__dirname,'/../tests/');

const testRunner={}
testRunner.verticalSpace=(arg)=>{
    arg=typeof arg =='number' && Math.floor(arg)>0?Math.floor(arg):1
    if(arg){
        for(let i=0;i<arg;i++){
            console.log('\n')
        }
    }
}
//Creates a horizontal line across the screen
testRunner.horizontalLine=()=>{
    let width=process.stdout.columns;
    let line='';
    for(let i=0;i<width;i++){
        line+='-'
    }
    console.log(line)
}
testRunner.centeredText=(str)=>{
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
testRunner.runTests=function(){
    return new Promise((resolve,reject)=>{
        fs.readdir(baseDir).then(fileNames=>{
            if(fileNames instanceof Array && fileNames.length!=0){
              fileNames.forEach(fileName=>{
                
                  fs.readFile(baseDir+fileName,'utf8').then(str=>{
                      eval(str)
                      app.runner=setInterval(()=>{
                            if(app.queue.isEmpty()){
                                clearInterval(app.runner)
                                resolve(app.tests) 
                            }
                        },500)
                  }).catch(err=>{
                      //console.log(err)
                  })
              })

            }
            else {
                resolve('No test files in the test directory')
            }
        }).catch(err=>{
            reject('Could not find test directory')
        })
    })
}
testRunner.produceReport=(tests)=>{
    let suites=0;
    let units=0;
    let passed=0;
    let errors=[];
    if(typeof tests =='object'){
        for(let suite in tests){
            if(tests.hasOwnProperty(suite)){
                suites++
                for(let test in tests[suite]){
                    if(tests[suite].hasOwnProperty(test)){
                        units++
                        if(tests[suite][test] instanceof Array){
                            let checkTest=tests[suite][test].every(obj=>{
                               if(obj.error) {
                                   obj.error.suite=suite
                                   obj.error.test=test
                                   errors.push(obj.error)
                                }
                               return obj.passed 
                            })
                            if(checkTest) passed++
                        }
                    }
                }
            }
        }
    }
    testRunner.verticalSpace(1)
    testRunner.horizontalLine()
    testRunner.centeredText('BEGIN TEST REPORT')
    testRunner.horizontalLine();
    testRunner.verticalSpace();
    console.log('Total Suites: '+suites)
    console.log('Total Tests: '+units);
    console.log('\x1b[32m%s\x1b[0m','Passed: '+passed);
    console.log('\x1b[31m%s\x1b[0m','Failed: '+(units-passed));
    testRunner.verticalSpace(1)
    if(errors.length!=0){
        testRunner.verticalSpace(1)
        testRunner.horizontalLine()
        testRunner.centeredText('BEGIN ERROR DETAILS')
        testRunner.horizontalLine();
        testRunner.verticalSpace();
        errors.forEach(error=>{
            console.log('\x1b[31m%s\x1b[0m','Suite: '+error.suite)
            console.log('\x1b[31m%s\x1b[0m','Test: '+error.test)
            console.log('\x1b[31m%s\x1b[0m',error.name)
            console.log(error)
            testRunner.verticalSpace();
        })
        testRunner.verticalSpace(1)
        testRunner.horizontalLine()
        testRunner.centeredText('END ERROR DETAILS')
        testRunner.horizontalLine()

    }
    testRunner.horizontalLine()
    testRunner.centeredText('END TEST REPORT')
    testRunner.horizontalLine()
    testRunner.verticalSpace(1)

}
testRunner.runTests().then(tests=>{
    testRunner.produceReport(tests)
    process.exit(0)
}).catch(err=>{
    //console.log(err)
})

