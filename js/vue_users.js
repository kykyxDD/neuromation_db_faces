const LINK_DB = "http://192.168.2.2:19877/face/list";
const LINK_POST_EDITED = "http://192.168.2.2:19877/face/set/";
const LINK_GET_PHOTO = "http://192.168.2.2:9000/";

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
      lenId: 5,
      maxLenImg: 3,
      maxLenUser: 8,
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
      let self = this
      this.loadInfo = true

      this.loadedResult = true
      console.log(this)
      fetch(this.linkDb)
      .then(function(response) {
        return response.json();
      })
      .then(function(db_user) {
        self.loadedResult = false
        self.parseData(db_user)
      })
      .catch( function(err) {
        self.loadedResult = false
        console.error(err)
      });
    },
    postEditedUser(user_id, data) {
      let self = this
      console.log('postEditedUser', user_id, data )
      const link = LINK_POST_EDITED + user_id
      this.loadedResult = true
      let body = new URLSearchParams(data)
      
      fetch(link, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }).then(function(response) {

        return response
      })
      .then(function(response) {
        // alert(user.name); // iliakan
        self.loadedResult = false
        console.log('done',response)
      })
      .catch(function(err) {
        self.loadedResult = false
        console.error(err)
      });
    },
    parseData(db_user) {
      let self = this
      this.loadInfo = false

      this.users = db_user.faces
      this.users.forEach(function(user){
        user.img = self.getImage(user.id)
      })

      let pageUser = +(this.paramsUrl.get('pageUser') || 0)
      this.itemPageUser = pageUser
      this.maxPageUser = Math.ceil(this.users.length/this.maxLenUser)
      this.setViewUser(pageUser)

    },
    setViewUser(pageUser) {
      const f = pageUser*this.maxLenUser;
      const l = (pageUser+1)*this.maxLenUser;
      this.viewUser = this.users.slice(f, l)
      this.viewUser.forEach(function(user){
        user.edit = false
      })

      this.$nextTick(function(){
        console.log('setViewUser nextTick')
      })
    },
    errorImage(e) {
      e.target.classList.add('error_img')
      e.target.src = this.defaultImg
    },
    getImage(id) {
      let arr = [];
      const len = this.lenId - (''+id).length
      const str_id = this.getArray(len) + id
      arr.push(`${LINK_GET_PHOTO}face_${str_id}.jpg` )
      for(var i = 0; i < this.maxLenImg; i++){
        const str_id_photo = this.getArray(this.lenId - (''+i).length)+ (i+1)
        arr.push(`${LINK_GET_PHOTO}face_${str_id}__${str_id_photo}.jpg` )
      }
      return arr
    },
    getArray(len) {
      let arr = [];
      for(let i = 0; i < len; i++){
        arr.push(0)
      }
      return arr.join('')
    },
    saveGlobalUser(update_user) {
      this.users.forEach(function(user){
        if(user.id == update_user.old_id){
          // user.id = update_user.id
          user.name = update_user.name
          user.collapse_to_id = update_user.collapse_to_id
        }
      })
    },
    saveEditUser(index){
      let post_data = {}
      let user = this.viewUser[index];
      const new_name = this.$el.querySelector('#user_name_'+user.id).value
      const new_collapse = this.$el.querySelector('#user_collapse_'+user.id).value
      if(new_name != user.name) {
        post_data.name = new_name
      }
      user.name = new_name

      if(new_collapse != user.collapse_to_id){
        post_data.collapse_to_id = new_collapse
      }
      if(new_collapse != user.collapse_to_id){
        if(new_collapse) {
          user.collapse_to_id = new_collapse
        } else {
          user.collapse_to_id = 0
        }
        post_data.collapse_to_id = user.collapse_to_id
      }

      this.isEditUser(index, false)
      this.saveGlobalUser(user)
      this.postEditedUser(user.id, post_data)
    },
    isEditUser(index, status){
      this.viewUser[index].edit = status
      
      this.loadInfo = !this.loadInfo
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