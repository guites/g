(function(e){function t(t){for(var a,n,o=t[0],l=t[1],u=t[2],c=0,g=[];c<o.length;c++)n=o[c],Object.prototype.hasOwnProperty.call(r,n)&&r[n]&&g.push(r[n][0]),r[n]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(e[a]=l[a]);m&&m(t);while(g.length)g.shift()();return i.push.apply(i,u||[]),s()}function s(){for(var e,t=0;t<i.length;t++){for(var s=i[t],a=!0,n=1;n<s.length;n++){var l=s[n];0!==r[l]&&(a=!1)}a&&(i.splice(t--,1),e=o(o.s=s[0]))}return e}var a={},r={app:0},i=[];function n(e){return o.p+"js/"+({about:"about"}[e]||e)+"."+{about:"89b511c6"}[e]+".js"}function o(t){if(a[t])return a[t].exports;var s=a[t]={i:t,l:!1,exports:{}};return e[t].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.e=function(e){var t=[],s=r[e];if(0!==s)if(s)t.push(s[2]);else{var a=new Promise((function(t,a){s=r[e]=[t,a]}));t.push(s[2]=a);var i,l=document.createElement("script");l.charset="utf-8",l.timeout=120,o.nc&&l.setAttribute("nonce",o.nc),l.src=n(e);var u=new Error;i=function(t){l.onerror=l.onload=null,clearTimeout(c);var s=r[e];if(0!==s){if(s){var a=t&&("load"===t.type?"missing":t.type),i=t&&t.target&&t.target.src;u.message="Loading chunk "+e+" failed.\n("+a+": "+i+")",u.name="ChunkLoadError",u.type=a,u.request=i,s[1](u)}r[e]=void 0}};var c=setTimeout((function(){i({type:"timeout",target:l})}),12e4);l.onerror=l.onload=i,document.head.appendChild(l)}return Promise.all(t)},o.m=e,o.c=a,o.d=function(e,t,s){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(o.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)o.d(s,a,function(t){return e[t]}.bind(null,a));return s},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="/",o.oe=function(e){throw console.error(e),e};var l=window["webpackJsonp"]=window["webpackJsonp"]||[],u=l.push.bind(l);l.push=t,l=l.slice();for(var c=0;c<l.length;c++)t(l[c]);var m=u;i.push([0,"chunk-vendors"]),s()})({0:function(e,t,s){e.exports=s("56d7")},"56d7":function(e,t,s){"use strict";s.r(t);var a=s("2b0e"),r=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",{attrs:{id:"app"}},[e._m(0),s("router-view",{staticClass:"container"})],1)},i=[function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("header",[s("div",{staticClass:"inner-header"},[s("nav",[s("ul",[s("li",[e._v("gchan")]),s("li",[s("a",{attrs:{href:"#mensagens"}},[e._v("mensagens")])]),s("li",[s("a",{attrs:{href:"#info"}},[e._v("info/postagem")])])])]),s("form",[s("label",{attrs:{for:"search"}},[e._v("Busque:")]),s("input",{attrs:{type:"text",name:"search",placeholder:"assunto/mensagem",required:""}}),s("button",{attrs:{type:"sumit"}},[e._v("pesquisar")])])])])}],n=s("2877"),o={},l=Object(n["a"])(o,r,i,!1,null,null,null),u=l.exports,c=s("8c4f"),m=function(){var e=this,t=e.$createElement,s=e._self._c||t;return s("div",[s("section",{staticClass:"create-thread"},[s("form",{on:{submit:function(t){return t.preventDefault(),e.addMessage(t)}}},[e.error?s("div",{staticClass:"alert-error"},[s("close",{on:{click:function(t){e.error=""}}},[e._v("x")]),s("h4",[e._v("Erro!")]),s("p",[e._v(e._s(e.error))])],1):e._e(),s("div",{staticClass:"form-group"},[s("label",{attrs:{for:"username"}},[e._v("Usuário")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.message.username,expression:"message.username"}],staticClass:"form-control",attrs:{type:"text",id:"username","aria-describedby":"usernameHelp",value:"anon",required:""},domProps:{value:e.message.username},on:{input:function(t){t.target.composing||e.$set(e.message,"username",t.target.value)}}}),s("small",{staticClass:"form-text text-muted",attrs:{id:"usernameHelp"}},[e._v(" remember: no use for a name ")])]),s("div",{staticClass:"form-group"},[s("label",{attrs:{for:"subject"}},[e._v("Assunto")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.message.subject,expression:"message.subject"}],staticClass:"form-control",attrs:{type:"subject",id:"subject",placeholder:"subject",required:""},domProps:{value:e.message.subject},on:{input:function(t){t.target.composing||e.$set(e.message,"subject",t.target.value)}}})]),s("div",{staticClass:"form-group"},[s("label",{attrs:{for:"message"}},[e._v("Mensagem")]),s("textarea",{directives:[{name:"model",rawName:"v-model",value:e.message.message,expression:"message.message"}],staticClass:"form-control",attrs:{id:"message",rows:"5"},domProps:{value:e.message.message},on:{input:function(t){t.target.composing||e.$set(e.message,"message",t.target.value)}}})]),s("div",{staticClass:"form-group"},[s("label",{attrs:{for:"imageURL"}},[e._v("image URL")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.message.imageURL,expression:"message.imageURL"}],staticClass:"form-control",attrs:{type:"url",id:"imageURL",placeholder:"https://~"},domProps:{value:e.message.imageURL},on:{input:function(t){t.target.composing||e.$set(e.message,"imageURL",t.target.value)}}}),s("div",{staticClass:"gif-search-toggle",attrs:{"data-toggle":"buttons"}},[s("input",{attrs:{type:"radio",name:"options",id:"option1",autocomplete:"off",checked:"",value:"giphy"},on:{change:e.searchGif}}),s("label",{staticClass:"btn btn-primary",attrs:{for:"option1"}},[e._v("Giphy")]),s("input",{attrs:{type:"radio",name:"options",id:"option2",autocomplete:"off",value:"gfycat"},on:{change:e.searchGif}}),s("label",{staticClass:"btn btn-primary",attrs:{for:"option2"}},[e._v("gfycat")])]),s("label",{attrs:{for:"giphy-search"}},[e._v("Busque um gif")]),s("input",{directives:[{name:"model",rawName:"v-model",value:e.message.giphyURL,expression:"message.giphyURL"}],staticClass:"form-control",attrs:{type:"text",id:"giphyURL",placeholder:"cats"},domProps:{value:e.message.giphyURL},on:{keyup:e.searchGif,input:function(t){t.target.composing||e.$set(e.message,"giphyURL",t.target.value)}}})]),s("button",{staticClass:"btn btn-primary",attrs:{type:"submit"}},[e._v("Enviar")])]),s("div",{staticClass:"gifBoxWrapper"},[e.emptyGifResults?s("div",{staticClass:"emptyGifResults"},[s("img",{staticClass:"emptyGifResultsImg",attrs:{src:"https://via.placeholder.com/480?text=nenhum gif :("}})]):e._e(),""===e.emptyGifResults?s("div",{staticClass:"gifBox"},e._l(e.uniqueGifs,(function(t){return s("div",{key:t.id,staticClass:"gifBoxGif"},[s("img",{staticClass:"gif-thumb",attrs:{"data-original":t.originalUrl,src:t.thumbUrl},on:{click:e.selectGif}})])})),0):e._e(),s("div",{staticClass:"paginate-arrows"},[e.hasPag?s("ul",{staticClass:"pagination"},[s("div",e._l(e.numPages,(function(t){return s("li",{key:t,staticClass:"page-item",class:{active:e.currPage==t},on:{click:e.paginateGif}},[s("a",{staticClass:"page-link",attrs:{href:"#void"}},[e._v(e._s(t))])])})),0)]):e._e()])])]),e._l(e.reversedMessages,(function(t){return s("div",{key:t._id,staticClass:"list-unstyled d-flex flex-column align-items-center"},[s("li",{staticClass:"media"},[t.imageURL?s("img",{staticClass:"img-thumbnail",attrs:{src:t.imageURL,alt:t.subject}}):s("img",{staticClass:"img-thumbnail",attrs:{src:"https://via.placeholder.com/300?text=:("}}),s("div",{staticClass:"align-self-center media-body"},[s("h4",{staticClass:"mt-0 mb-1"},[e._v(e._s(t.username))]),s("h5",{staticClass:"mt-0 mb-1"},[e._v(e._s(t.subject))]),e._v(" "+e._s(t.message)+" "),s("br"),s("small",[e._v(e._s(t.created))])])]),s("hr")])}))],2)},g=[];const p="https://gchan-message-board.herokuapp.com/messages";var f={name:"Home",data:()=>({gifsPerPage:4,currPage:1,numPages:5,error:"",apiRoute:"giphy",emptyGifResults:"",hasPag:"",messages:[],gifs:[],message:{username:"Anonymous",subject:"",message:"",imageURL:""}}),computed:{reversedMessages(){return this.messages.slice().reverse()},uniqueGifs(){const e=[],t=new Map;return this.gifs.forEach(s=>{t.has(s.id)||(t.set(s.id,!0),e.push({id:s.id,thumbUrl:s.thumbUrl,originalUrl:s.originalUrl}))}),e}},mounted(){fetch(p).then(e=>e.json()).then(e=>{this.messages=e})},methods:{addMessage(){fetch(p,{method:"POST",body:JSON.stringify(this.message),headers:{"content-type":"application/json"}}).then(e=>e.json()).then(e=>{if(e.details){const t=e.details.map(e=>e.message).join(".");this.error=t}else this.error="",this.messages.push(e)})},searchGif(e){let t;switch(t="giphyURL"===e.target.id?e.target.value:document.querySelector("#giphyURL").value,this.hasPag=""===t?"":"1",document.querySelector("input[type='radio']:checked").value){default:this.apiRoute="giphy",fetch(`https://api.giphy.com/v1/gifs/search?api_key=5KnNW5U9nJ2Xjnas3lugKxMIXVdCsrqF&q=${t}&limit=${this.gifsPerPage}&offset=${(this.currPage-1)*this.gifsPerPage}`).then(e=>e.json()).then(e=>{const t=e.data;0===t.length?this.emptyGifResults=1:this.emptyGifResults="",this.gifs=[],t.forEach(e=>{this.gifs.push({id:e.id,thumbUrl:e.images.preview_webp.url,originalUrl:e.images.original.webp})})}).catch(e=>{console.log(e),this.emptyGifResults=1});break;case"gfycat":this.apiRoute="gfycat",fetch(`https://api.gfycat.com/v1/gfycats/search?count=${this.gifsPerPage*this.numPages}&search_text='${t}`).then(e=>e.json()).then(e=>{const t=e.gfycats;document.querySelector(".pagination .page-item:last-child a").setAttribute("data-cursor",e.cursor),this.gfycatCursor=e.cursor,0===t.length?this.emptyGifResults=1:this.emptyGifResults="";const s=(this.currPage-1)*this.gifsPerPage,a=s+this.gifsPerPage;this.gifs=[];let r=0;t.forEach(e=>{r>=s&&r<a&&this.gifs.push({id:e.gfyId,thumbUrl:e.max1mbGif,originalUrl:e.webpUrl}),r+=1})}).catch(e=>{console.log(e),this.emptyGifResults=1});break}},selectGif(e){const t=e.target.getAttribute("data-original");document.querySelector("#imageURL").value=t,this.message.imageURL=t},paginateGif(e){this.currPage=e.target.innerText,this.searchGif(e)}}},h=f,d=Object(n["a"])(h,m,g,!1,null,null,null),v=d.exports;a["a"].use(c["a"]);const b=[{path:"/",name:"Home",component:v},{path:"/about",name:"About",component(){return s.e("about").then(s.bind(null,"f820"))}}],y=new c["a"]({routes:b});var _=y;a["a"].config.productionTip=!1,new a["a"]({router:_,render(e){return e(u)}}).$mount("#app")}});
//# sourceMappingURL=app.2d5ba677.js.map