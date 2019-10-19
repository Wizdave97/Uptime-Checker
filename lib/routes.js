const handlers=require('./handlers');
const checks=require('./controllers/checks/checks')
const tokens=require('./controllers/tokens/tokens')
const users=require('./controllers/users/users')
const views=require('./controllers/views/views')
const { checkAuth}=require('./helpers');
const Router=require('./Router');

const router=new Router()
//Front End Routes
router.add('','get',views.index)
router.add('static','get',views.serveStaticAssets)
router.add('favicon.ico','get',views.favicon)
router.add('account/create','get',views.accountCreate)
router.add('account/edit','get',views.accountEdit)
router.add('session/create','get',views.sessionCreate)
router.add('checks/all','get',views.checksList)
router.add('checks/edit','get',views.checksEdit)
router.add('checks/create','get',views.checksCreate)
//Ping Routes
router.add('ping','get',handlers.ping)

//Users Routes
router.add('api/users','get',checkAuth,users.getUser)
router.add('api/users','post',users.addUser)
router.add('api/users','put',checkAuth,users.updateUser)
router.add('api/users','delete',checkAuth,users.deleteUser)

//Tokens Routes
router.add('api/tokens','post',tokens.postToken)
router.add('api/tokens','put',checkAuth,tokens.putToken)
router.add('api/tokens','delete',checkAuth,tokens.deleteToken)

//Checks Routes
router.add('api/checks','post',checkAuth,checks.postCheck)
router.add('api/checks','get',checkAuth,checks.getCheck)
router.add('api/checks/all','get',checkAuth,checks.getAllChecks)
router.add('api/checks','delete',checkAuth,checks.deleteCheck)
router.add('api/checks','put',checkAuth,checks.putCheck)

module.exports=router