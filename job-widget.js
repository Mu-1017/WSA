var mainRun =  function(){
    "use strict";
    var n={},a={},
        d=function(t){
          //console.log(t);
          var e;return t.apiKey?(e=t.url||"https://api.teamtailor.com/v1/jobs?",e+="api_version=20161108&",
                                 e+="include=department,locations&",
                                 e+="fields[departments]=name&",
                                 e+="fields[locations]=name,city&",
                                 e+="page[number]="+t.pagenum +"&",
                                 t.limit&&(t.limit=Math.min(t.limit,30),
                                 e=e+"page[size]="+t.limit+"&"),
                                 t.feed?e=e+"filter[feed]="+t.feed+"&":e+="filter[feed]=public&",t.departments&&(e=e+"filter[department]="+t.departments+"&"),
                         t.region&&(e=e+"filter[regions]="+t.region+"&"),
                         t.preselectedDepartment&&(e=e+"filter[department]="+t.preselectedDepartment+"&"),t.preselectedLocation&&(e=e+"filter[locations]="+t.preselectedLocation+"&"),t.locations&&(e=e+"filter[locations]="+t.locations+"&"),e=e+"api_key="+t.apiKey+"&"):(e=t.url||"https://tt.teamtailor.com/api/jobs?",t.limit&&(e=e+"limit="+t.limit+"&"),t.preselectedDepartment&&(e=e+"department_name="+t.preselectedDepartment+"&"),t.departments&&(e=e+"department_id="+t.departments+"&"),t.locations&&(e=e+"location_id="+t.locations+"&"),t.internalJobs&&(e=e+"internal="+t.internalJobs+"&"),e=e+"company_id="+t.company),e}, 
        //end func d
        
        p=function(t,e){
          //print all request
          //console.log(t);
          var a,n=!!window.XDomainRequest,i=function(){e(JSON.parse(a.responseText))};n?((a=new window.XDomainRequest).onprogress=function(){return!0},a.onload=i,a.open("GET",t)):((a=new XMLHttpRequest).open("GET",t,!0),a.onreadystatechange=function(){4===this.readyState&&200<=this.status&&this.status<400&&i()}),a.send()},
        //end func p
        
        o=function(t,a,n,i){
      i===undefined&&(i=[]),n.apiKey?p(t,function(t){if(i=i.concat(t.data),t.links&&t.links.next){var e=t.links.next;e+="&api_key="+n.apiKey,o(e+="&api_version=20161108",a,n,i)}else t.data=i,a(t)}):p(t,a)},
        //end func o
        
        l=function(t){
      if(t)for(var e=0;e<t.length;e++)"departments"===t[e].type?n[t[e].id]=t[e]:"locations"===t[e].type&&(a[t[e].id]=t[e])},
        //end func l
        
        i=function(t){
      var e=t.department_name;if(e)return e;if(t.relationships&&t.relationships.department.data){var a=n[t.relationships.department.data.id];if(a)return a.attributes.name}return null},
        //end func i
        
        r=function(t){
      var e=t.location_name;return e||(t.relationships&&t.relationships.locations.data?t.relationships.locations.data.map(function(t){var e=a[t.id];return e?e.attributes.name&&""!==e.attributes.name?e.attributes.name:e.attributes.city:null}).join(", "):null)},
        //end func r
        
        s=function(t){
      var e=i(t);if(!e)return null;var a=document.createElement("span");return a.className="teamtailor-jobs__department",a.textContent!==undefined?a.textContent=e:a.innerText=e,a},
        //end func s
        
        m=function(t){
      var e=r(t);if(!e)return null;var a=document.createElement("span");return a.className="teamtailor-jobs__location",a.textContent!==undefined?a.textContent=e:a.innerText=e,a},
        //end func m
        
        c=function(t){
      var e=document.createElement("span");e.className="teamtailor-jobs__job-info";var a=s(t),n=m(t);return a&&e.appendChild(a),a&&n&&e.appendChild(document.createTextNode(" - ")),n&&e.appendChild(n),e},
        //end func c
        
        u=function(t,e){
          var a,n=document.createElement("a"),i=(a=t.links?t.attributes.internal?t.links["careersite-job-internal-url"]:t.links["careersite-job-url"]:e.internalJobs?t.preview_url:t.url).split("/")[2];a+="?utm_campaign=jobs-widget&utm_source="+i+"&utm_content=jobs&utm_medium=web",n.className="teamtailor-jobs__job-title",n.setAttribute("href",a),e.popup&&n.setAttribute("target","_blank");var r=t.title||t.attributes.title;return n.textContent!==undefined?n.textContent=r:n.innerText=r,n},
        //end func u
        
        b=function(t,e){
          var a=document.createElement("div");
          return a.className="teamtailor-jobs__job",a.appendChild(u(t,e)),a.appendChild(c(t)),a
        },
        //end func b
        
        //create job lists
        f=function(t,e,a){
          var n,i=t.querySelectorAll(".teamtailor-jobs__job-wrapper")[0];
          i.style.minHeight = "550px";
          i.innerHTML="",
            a.apiKey?(n=e.data,l(e.included)):n=e.jobs;
          
          if(n.length === 0) 
            er(i);
          else{
            for(var r=0;r<n.length;++r)
              i.appendChild(b(n[r],a));
          }
          
          var z=document.createElement("div");
          z.className="teamtailor-jobs__paging",
          t.appendChild(z);//append paging
          pa(t,e,a);
        },
        //end func f
        
        er=function(i)
        { 
            var e = document.createElement("div");
            e.style.display = "flex";
            e.style.justifyContent = "center";
            e.style.alignItems = "center";
            e.style.width = "100%";
            e.style.height = "300px";
            e.style.fontSize = "x-large";
            var link = document.createElement("a");
            link.innerHTML = "Connect with us";
            link.href = "https://careers.wsa.com/connect";
            link.target = "_blank";
            var p = document.createElement("p");
            p.appendChild(link);
            p.appendChild(document.createTextNode(" to stay up to date on new openings."));
            e.appendChild(p);
            i.appendChild(e);
        },
        
        //create page buttons
        pa=function(l,e,n){
          var i=l.querySelectorAll(".teamtailor-jobs__paging")[0];
          i.innerHTML="";
          i.style.textAlign = "center";
          var count = e.meta["page-count"];
          if(count>1)
          {
            for(var r=0;r<count;++r)
            {
              var b = document.createElement("button");
              b.innerHTML = r+1;
              b.style.margin=".3em";
              if(r+1==n["pagenum"])
              {
                b.style.backgroundColor = "#778899";
                b.style.color = "white";
                b.style.border = "2px solid #778899";
                b.disabled = true;
              }
              else
              {
                  b.addEventListener("click",function(t){
                    n["pagenum"]=t.target.innerHTML,p(d(n),function(t){f(l,t,n)})
                  })
              };
              i.appendChild(b);
            }
          }
        },
        
        //create filter options
        op=function(t,n,e,a,i){
          var r=document.createElement("option"),o=document.createElement("select");
          o.className="teamtailor-jobs__select";
          var l,s,m=function(t)
          {
            var e;e="locations"===n?t.attributes?t.attributes.name&&""!==t.attributes.name?t.attributes.name:t.attributes.city:t.name:t.attributes?t.attributes.name:t.name;
            var a=document.createElement("option");
            return a.value=t.id,a.innerText=e,a
          };
          
          i.apiKey?(l=t.meta.texts.all,s=t.data):(l=t.text,s=t.items),r.innerText=l,r.value="",o.appendChild(r);   
          
          s = n==="locations"?s.filter(i => i.attributes.country === "Australia"):s;
          
          for(var c=0;c<s.length;++c)
            o.appendChild(m(s[c]));
          
          o.addEventListener("change",
          function(t){
            i[n]=t.target.value,p(d(i), function(t){f(e,t,i)})
                     }),a.appendChild(o)},
        //end func _
        
        v=function(e,a,n){
          var t;
          n.apiKey?
            (t=n.url||"https://api.teamtailor.com/v1/"+e+"?api_key="+n.apiKey+"&api_version=20161108",
             "locations"===e?
             (t=n.url||"https://api.teamtailor.com/v1/locations?api_key="+n.apiKey+"&api_version=20161108",t+="&fields[locations]=name,country,city")
             :(t=n.url||"https://api.teamtailor.com/v1/departments?api_key="+n.apiKey+"&api_version=20161108",t+="&fields[departments]=name"))
          :t="https://tt.teamtailor.com/api/"+e+"?company_id="+n.company;

          var i=document.createElement("div"),r=a.querySelectorAll(".teamtailor-jobs__filters")[0];
          i.style.textAlign = "right";
          i.className="teamtailor-jobs__select-wrapper",r.appendChild(i),o(t,function(t){(t.items&&t.items.length||t.data&&t.data.length)&&op(t,e,a,i,n)},n)},
        //end func v
        
        y=function(){
      var t="",
      e=document.head||document.getElementsByTagName("head")[0],
      a=document.createElement("style");
      t+=".teamtailor-jobs__job-title { display: block; }",
        t+=".teamtailor-jobs__job { margin-bottom: 1em; }",
        t+=".teamtailor-jobs__select-wrapper { float: right; margin: 0 1em 1em 0; }",
        t+=".teamtailor-jobs__job-wrapper { clear: right; }",
        a.type="text/css",
        a.styleSheet?a.styleSheet.cssText=t : a.appendChild(document.createTextNode(t)),
        e.appendChild(a)
        }; 
    //end func y
  
    //start return
    return{ 
               init:
                function(i)
               {
                 i.company||i.apiKey?
                   p(d(i),
                     function(t)
                     {
                      var e=i.jobsWidget||document.getElementById("teamtailor-jobs-widget"),  
                          //create job wrapper
                      a=document.createElement("div");
                      if(a.className="teamtailor-jobs__job-wrapper",
                       e.appendChild(a),//append job list
                       f(e,t,i),
                       // e.appendChild(z),//append paging
                       // pa(e,t,i),
                         //create job wrapper end
                         
                       (i.departmentSelect||i.locationSelect)
                       &&(!i.preselectedDepartment||!i.preselectedLocation))
                      {
                        var n=document.createElement("div");
                        n.className="teamtailor-jobs__filters",
                        e.insertBefore(n,a),
                        i.locationSelect&&!i.preselectedLocation&&v("locations",e,i),
                        i.departmentSelect&&!i.preselectedDepartment&&v("departments",e,i)
                      };//End if                
                 }//end function
                    )//end func p
                 :alert("missing api key")
                  },
               run:
               function(){
                 if(!window.TEAMTAILOR_JOB_SCRIPT_LOADED)
                 {
                   window.TEAMTAILOR_JOB_SCRIPT_LOADED=!0,y();
                   for(var t=document.querySelectorAll(".teamtailor-jobs-widget"),e=0;e<t.length;++e)
    
                    Teamtailor.JobsSource.init(
                    {
                      company:t[e].getAttribute("data-teamtailor-company"),
                      apiKey:t[e].getAttribute("data-teamtailor-api-key"),
                      region:t[e].getAttribute("data-teamtailor-region"),
                      limit:t[e].getAttribute("data-teamtailor-limit"),
                      pagenum:t[e].getAttribute("data-teamtailor-pagenum"),
                      preselectedDepartment:t[e].getAttribute("data-teamtailor-department"),
                      preselectedLocation:t[e].getAttribute("data-teamtailor-location"),
                      popup:t[e].getAttribute("data-teamtailor-popup"),
                      internalJobs:t[e].getAttribute("data-teamtailor-internal-jobs"),
                      feed:t[e].getAttribute("data-teamtailor-feed"),
                      departmentSelect:t[e].getAttribute("data-teamtailor-department-select"),
                      locationSelect:t[e].getAttribute("data-teamtailor-location-select"),jobsWidget:t[e]
                    });
                 }
               }
              }
    //end return
}();


var Teamtailor=window.Teamtailor||{};
Teamtailor.JobsSource=Teamtailor.JobsSource||mainRun,
  "complete"===document.readyState||
  "interactive"===document.readyState||
  Teamtailor.JobsSource||
  Teamtailor.JobsSource.run?
              Teamtailor.JobsSource.run():
              document.addEventListener("DOMContentLoaded",Teamtailor.JobsSource.run);
