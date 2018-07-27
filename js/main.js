function Main(params){
  var parent = document.getElementById(params.idElem ? params.idElem : 'main')
  console.log(parent)
  this.link_db = params && params.api ? params.api : './data/db.json'
  this.getData();

  this.paramsUrl = (new URL(document.location)).searchParams;
  this.parin = this.paramsUrl.get("pageUser");
  console.log(this.parin)
}
Main.prototype = {
  getData: function(){
    var self = this;
    fetch(this.link_db)
    .then(function(response) {
      // alert(response.headers.get('Content-Type')); // application/json; charset=utf-8
      // alert(response.status); // 200

      return response.json();
    })
    .then(function(db_user) {
      // alert(user.name); // iliakan
      console.log('user',db_user)
      self.
    })
    .catch( function(err) {
      console.error(err)
    } );
  }
},
viewUsers: function(){
  
},

function createElem(tag, class_name, parent){
  let elem = document.createElement(tag);
  if(class_name) {
    elem.className = class_name;
  }
  if(parent) {
    parent.appendChild(elem)
  }
  return elem
}