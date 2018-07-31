Vue.component('paginate',{
  props: ['item', 'maxPageUser','clickHandler'],
  template: `
    <div class="pagination"> 
      <div @click="clickHandler(item-1)" 
        class="pagination-prev" 
        v-bind:class="{ disabled: disabledBtnPrevPage }">
        <i class="fas fa-angle-left"></i> 
      </div>

      <div 
        v-for="(page, index) in listPagePagin" 
        :key="index"
        class="" 
        @click="clickHandler(page)"
        v-bind:class="{ active: item == page, 'pagination-item': page, ellipsis: !page }"
      >{{ page ? page : '...' }}</div>

      <div 
        @click="clickHandler(item+1)" 
        class="pagination-next" 
        v-bind:class="{ disabled: disabledBtnNextPage }">
        <i class="fas fa-angle-right"></i>
      </div>
    </div>
  `,
  computed: {
    listPagePagin: function(){
      const p = this.item;
      let arr = [1,  p-1, p , p+1,this.maxPageUser];
      arr.sort(function(a,b){
        return a - b
      })
      for(var i = 0; i < arr.length;i++){
        if(arr[i] < 1 || arr[i] > this.maxPageUser) {
          arr.splice(i,1)
          i--
        } else if(arr[i-1] && arr[i-1] == arr[i]){
          arr.splice(i,1)
          i--
        }
      }
      
      if(arr.length > 1){
        for(var i = 1; i < arr.length; i++){
          if(arr[i-1] && Math.abs(arr[i] - arr[i-1]) > 1){
            arr.splice(i, 0, null)
            i++
          }
        }
      }
      // arr.push(null)
      return arr
    },
    disabledBtnPrevPage: function(){
      return this.item == 1
    },
    disabledBtnNextPage: function(){
      return this.item == this.maxPageUser
    }
  }
})