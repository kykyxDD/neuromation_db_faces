const LINK_DB = "./data/db.json" ;

const app = new Vue({
	el:'#app',
	data() {
		return {
      updateStatusUser: false,
      loadInfo: false,
      linkDb: LINK_DB,
      linkFolder: '',
      users: [],
      viewUser: [],
      paramsUrl: (new URL(document.location)).searchParams,
      itemPageUser: 0,
      maxPageUser:0,
			buy:0,
			buyStock:null,
			buyError:false,
			sell:0,
			sellStock:null,
      sellError:false,
      maxLenImg: 4,
      maxLenUser: 5,
      defaultImg: './images/error.png'
		}
	},
	mounted:function() {
    console.log('vue')

    let folder = this.linkDb.split('/')
    this.linkFolder = folder.slice(0, folder.length-1).join('/')+'/'

    this.getUsers()
	},
	methods:{
    getUsers() {
      var self = this
      this.loadInfo = true
      console.log(this)
      fetch(this.linkDb)
      .then(function(response) {
        // alert(response.headers.get('Content-Type')); // application/json; charset=utf-8
        // alert(response.status); // 200

        return response.json();
      })
      .then(function(db_user) {
        // alert(user.name); // iliakan
        console.log('user',db_user)
        
        self.parseData(db_user)
      })
      .catch( function(err) {
        console.error(err)
      } );
    },
    postUsers(data){
      fetch(this.linkDb,{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(function(response) {
        // alert(response.headers.get('Content-Type')); // application/json; charset=utf-8
        // alert(response.status); // 200

        return response.json();
      })
      .then(function(db_user) {
        // alert(user.name); // iliakan
        console.log("done")
        
        // self.parseData(db_user)
      })
      .catch( function(err) {
        console.error(err)
      } );
    },
    parseData(db_user) {
      let self = this
      this.loadInfo = false

      this.users = db_user.people
      this.users.forEach(function(user){
        user.img = self.getImage(user.id)
      })

      let pageUser = +(this.paramsUrl.get('pageUser') || 0)
      this.itemPageUser = pageUser
      this.maxPageUser = Math.ceil(this.users.length/this.maxLenUser)
      this.setViewUser(pageUser)
      
      // console.log(this.viewUser)
    },
    setViewUser(pageUser) {
      const f = pageUser*this.maxLenUser;
      const l = (pageUser+1)*this.maxLenUser;
      this.viewUser = this.users.slice(f, l)
      this.viewUser.forEach(function(user){
        user.edit = false
        user.old_id = user.id
      })
    },
    errorImage(e) {
      // console.log(e)
      e.target.classList.add('error_img')
      e.target.src = this.defaultImg
    },
    getImage(id) {
      let arr = [];
      for(var i = 0; i < this.maxLenImg; i++){
        arr.push(`${this.linkFolder+id}/${i+1}.jpg` )
      }
      // console.log(arr)
      return arr
    },
    saveGlobalUser(update_user) {
      this.users.forEach(function(user){
        if(user.id == update_user.old_id){
          user.id = update_user.id
          user.name = update_user.name
        }
      })
    },
    saveEditUser(index){
      let user = this.viewUser[index];
      const new_name = this.$el.querySelector('#user_name_'+user.id).value
      const new_id = this.$el.querySelector('#user_id_'+user.id).value
      // console.log(new_name, new_id)
      user.id = new_id
      user.name = new_name

      this.isEditUser(index, false)
      this.saveGlobalUser(user)
    },
    isEditUser(index, status){
      this.viewUser[index].edit = status
      
      this.loadInfo = !this.loadInfo
      // console.log(this.loadInfo)
    },
    postUpdateUser(){
      let result = this.users.map(function(user){
        return {
          id: user.id,
          name: user.name
        }
      })

      // console.log(result)
      return this.postUsers({people: result})
    },
    prevList(){
      // console.log('prevList')
      this.itemPageUser = Math.max(0, this.itemPageUser-1)
      this.setViewUser(this.itemPageUser)
    },
    itemList(index){
      // console.log('itemList',index)
      this.itemPageUser = index
      this.setViewUser(this.itemPageUser)
    },
    nextList(){
      // console.log('nextList')
      this.itemPageUser = Math.min(this.maxPageUser,this.itemPageUser+1)
      this.setViewUser(this.itemPageUser)
    }
	}
});