/* Shim: lets the page use google.script.run, but talks to the Apps Script web app via plain fetch (no Google sign-in cookies -> works on multi-account phones). */
(function(){
  var API='https://script.google.com/macros/s/AKfycbzTOxbwCcUOff0GbB2PqlBdThFS8zoC0UYU0JTZFFAsT7py36u7niVoFEpiG7iy_g/exec';
  function mk(ok,bad){
    return new Proxy({},{
      get:function(_,name){
        if(name==='withSuccessHandler')return function(f){return mk(f,bad);};
        if(name==='withFailureHandler')return function(f){return mk(ok,f);};
        return function(){
          var args=Array.prototype.slice.call(arguments);
          var url=API+'?api='+encodeURIComponent(name)+'&a='+encodeURIComponent(JSON.stringify(args))+'&_='+Date.now();
          fetch(url,{method:'GET',credentials:'omit',redirect:'follow',cache:'no-store'})
            .then(function(r){return r.text();})
            .then(function(t){
              var j; try{j=JSON.parse(t);}catch(e){throw new Error('Bad response from server');}
              if(!j.ok)throw new Error(j.error||'Server error');
              if(ok)ok(j.r);
            })
            .catch(function(e){ if(bad)bad(e); else console.error(e); });
        };
      }
    });
  }
  window.google={script:{run:mk(null,null)}};
})();
