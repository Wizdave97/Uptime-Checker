const levelup=require('levelup');
const leveldown=require('leveldown');
const sublevel=require('level-sublevel');

function createDB(){
    const db=sublevel(levelup(leveldown('./.data/uptimeDb'),{
        valueEncoding:'utf8'
    }))
    
    return {tokens:db.sublevel('tokens'),users:db.sublevel('users'),checks:db.sublevel('checks')}
}

module.exports=createDB()