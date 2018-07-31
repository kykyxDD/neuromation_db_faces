const LINK_DB = "http://192.168.2.2:19877/face/list";
// const LINK_DB = "./list.json";
const LINK_POST_EDITED = "http://192.168.2.2:19877/face/set/";
const LINK_GET_PHOTO = "http://192.168.2.2:9000/";

const app = new Vue({
	el:'#app',
	data() {
		return {
      loadPage: true,
      errorGetUsers: false,
      updateStatusUser: false,
      loadInfo: false,
      loadedGetResult: false,
      loadedPostResult: false,
      showMessagePost: false,
      messagePost: null,
      messagePostSettimeout: null,
      users: [],
      viewUser: [],
      paramsUrl: (new URL(document.location)).searchParams,
      itemPageUser: 1,
      maxPageUser: 1,
      lenId: 5,
      maxLenImg: 3, // количество картинок, которые отображаются ниже большое фотки лица
      maxLenUser: 8,  // количества людей на странице 
      defaultImg: './images/no_photo.png',
      minAge: 0, 
      maxAge: 100
		}
	},
	mounted: function() {
    let pageUser = +(this.paramsUrl.get('page') || 1)
    this.itemPageUser = pageUser
    this.getUsers(this.itemPageUser)
    const self = this;

    this.$el.classList.remove('d-none');
    window.addEventListener("popstate", this.watchLocationPathname.bind(this), false)
  },
  computed: {
    showMessageErrorPagination: function() {
      return this.users.length && this.itemPageUser > 1 && this.itemPageUser > this.maxPageUser
    }
  },
	methods:{
    getUsers(page) {
      let self = this
      this.loadInfo = true
      this.errorGetUsers = false
      let link = `${LINK_DB}?per_page=${this.maxLenUser}&page=${page}`

      this.loadedGetResult = true

      fetch(link)
      .then(function(response) {
        return response.json();
      })
      .then(function(db_user) {
        self.loadPage = false;
        self.loadedGetResult = false
        self.parseData(db_user)
      })
      .catch( function(err) {
        self.loadPage = false;
        self.loadedGetResult = false
        self.errorGetUsers = err.message
      });
    },
    postEditedUser(user_id, data) {
      let self = this

      const link = LINK_POST_EDITED + user_id
      this.loadedPostResult = true
      let body = new URLSearchParams(data)
      
      fetch(link, {
        method: 'POST',
        headers: {
          // 'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }).then(function(response) {
        return response
      })
      .then(function(response) {
        self.loadedPostResult = false
        self.showMessagePostUpdateUser(response.ok)
        // console.log('done',response)
      })
      .catch(function(err) {
        self.loadedPostResult = false
        self.showMessagePostUpdateUser(false)
        // console.error(err)
      });
    },
    showMessagePostUpdateUser(res){
      this.showMessagePost = true

      this.messagePost = res

      if(this.messagePostSettimeout) {
        clearTimeout(this.messagePostSettimeout)
      }

      this.messagePostSettimeout = setTimeout(this.hideMessagePostUpdateUser.bind(this), 5000)
    },
    hideMessagePostUpdateUser(){
      this.showMessagePost = false
    },
    parseData(db_user) {
      let self = this
      this.loadInfo = false

      this.users = db_user.faces
      this.users.forEach(function(user){
        user.img = self.getImage(user.id)
      })

      this.maxPageUser = Math.ceil(db_user.total_faces/this.maxLenUser) || Math.ceil(this.users.length/this.maxLenUser)
      
      this.setViewUser()

    },
    setViewUser() {

      let self = this
      this.viewUser = this.users.slice(0)
      this.viewUser.forEach(function(user){
        user.edit = false
        if(user.custom_params){
          user.last_visit = user.custom_params.last_visit_time ?  self.getTimeLastVisit(user.custom_params.last_visit_time) : false
          user.ages = user.custom_params.ages ?  self.getAges(user.custom_params.ages) : false
          user.gender = user.custom_params.genders ? self.getGender(user.custom_params.genders) : false
        }
      })

      // this.$nextTick(function(){
      //   console.log('setViewUser nextTick')
      // })
    },
    getTimeLastVisit(time) {
      let date = new Date(Date(time))
      const d = date.getDate(),
      m = date.getMonth(),
      y = date.getFullYear(),
      h = date.getHours(),
      min = date.getMinutes()


      return {
        d: (''+d).length == 1 ? `0${d}` : d,
        m: (''+m).length == 1 ? `0${m}` : m,
        y: y,
        h: (''+h).length == 1 ? `0${h}` : h,
        min: (''+min).length == 1 ? `0${min}` : min        
      }
    },
    getAges(ages) {
      let max_age = 0;
      let arr_max_age = [];
      let res = [];
      const l = ages.length
      const diff_age = (this.maxAge - this.minAge)/l
      ages.forEach(function(age){
        if(age > max_age) {
          max_age = age
        }
      });
      if(!max_age) return false

      ages.forEach(function(age, index){
        if(age == max_age){
          arr_max_age.push(index)
        }
      });

      arr_max_age.forEach(function(a){
        res.push([a*diff_age, (a+1)*diff_age - 1])
      })
      // console.log('ages', res)
      return res
    },
    getGender(genders){
      // console.log('genders', genders)
      if(genders[0] == genders[1]) {
        return "Not definitely"
      } else if(genders[0] > genders[1]){
        return 'Male'
      } else {
        return 'Female'
      }
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
      const elem_collapse = this.$el.querySelector('#user_collapse_'+user.id)
      const new_collapse = elem_collapse && elem_collapse.value
      if(new_name != user.name) {
        post_data.name = new_name
      }
      user.name = new_name


      if(new_collapse != user.collapse_to_id){
        if(new_collapse) {
          user.collapse_to_id = new_collapse
          post_data.collapse_to_id = new_collapse
        } else if(new_collapse == 0){
          user.collapse_to_id = 0
          post_data.collapse_to_id = new_collapse
        } else {
          post_data.collapse_to_id = 0
        }
        
      }

      this.isEditUser(index, false)
      this.saveGlobalUser(user)
      this.postEditedUser(user.id, post_data)
    },
    isEditUser(index, status){
      this.viewUser[index].edit = status
      
      this.loadInfo = !this.loadInfo
    },
    updateHref () {
      const item = this.itemPageUser
      let search_params = (new URL(document.location)).searchParams
      const page = search_params.get('page')
      if(!page || (page && +page != item)) {
        const href = document.location.href.replace(document.location.search, `?page=${item}`)
        // document.location.replace(href)
        window.history.pushState(null, null, `?page=${item}`)
      }
    },
    watchLocationPathname(pathname) { 
      let search_params = (new URL(document.location)).searchParams
      const page = search_params.get('page')
      console.log('page', page)
      if(page) {
        this.clickNewPage(+page, )
      }
    },
    clickNewPage(index, edit_page){
      this.itemPageUser = Math.max(1, Math.min(index, this.maxPageUser))
      if(!edit_page){
        this.updateHref()
      }
      

      // console.log(this.itemPageUser)
      //this.setViewUser(this.itemPageUser)
      this.getUsers(this.itemPageUser)
    }
	}
});