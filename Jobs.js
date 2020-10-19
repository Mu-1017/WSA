(function () {
  var apiKeyApac = {type:0, key:"Token " + "iYAnqDByMpqdxjBYdY8025x-UQDv9YFldAPCO1tN"};
  var apiKeyUsa = {type:1, key:"Token " + "UoyNkZrjKIymOtaVlxEzX4dNe9YDrGo9xGXQ-OrK"};
  var apiKeyEmeaLatin =  {type:2, key:"Token " + "W7oXUTtWNlfeJCpWFW10isSCJ1Gg6PQJEc_sb392"};
  var allApiKeys = [apiKeyApac,apiKeyUsa,apiKeyEmeaLatin];

  var jobList = new Array();
  var locationsList = new Array();
  var departmentList = new Array();
  var requestCount = 0;
  var expireTimeout = 300;
  var currentPage = 1;
  var numberPerPage = 15;
 
  preload();
  var allQueries = getQueries();
  if(haveSavedRecords()===false)
  {console.log("request new");
    requestJobList();
  }
  else
  {
    console.log("load cache");
    jobList = JSON.parse(localStorage.getItem('jobList'));
    departmentList = JSON.parse(localStorage.getItem('departmentList'));
    locationsList = JSON.parse(localStorage.getItem('locationsList'));
    loadPage();
  }

  function haveSavedRecords()
  {
    var savedTime = localStorage.getItem('savedTime');
    if(typeof savedTime!="undefined" && savedTime!=null)
    {
        //check whether expired
        var now = new Date();
        var diff = (now-Date.parse(savedTime))/1000;
        if(diff < expireTimeout)
        {
          return true;
        }
    }
    return false;
  }

  function getQueries()
  {
    var urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams.toString());
    var searchQry = {has: urlParams.has('query'), 
                      str: urlParams.get('query'),
                      arr: urlParams.has('query')? 
                                  urlParams.get('query')
                                           .split(/[\s,;\t\n]+/) : ""}

    var departmentQry = {has: urlParams.has('department'),
                          str: urlParams.get('department')};

    var query = (urlParams.get('location_id')||"").split('-');
    var locationQry = {has: urlParams.has('location_id'),
                          region: query[0],
                          id: query[1]};

    query = (urlParams.get('country')||"").split('-');
    var countryQry = {has: urlParams.has('country'),
                          region: query[0],
                          str: query[1]};
    return {search: searchQry,
            department: departmentQry,
            country: countryQry,
            location: locationQry };
  }

  function requestJobList()
  {
    requestCount  = allApiKeys.length;
    allApiKeys.forEach(key=>requestFullJobList(key, onResponse, 1));
  }

  function onResponse()
  {
    requestCount--;
    if(requestCount == 0)
      {   
        saveRecords();
        loadPage();
      }
  }

  function loadPage()
  {
    renderFilters();
    filterJobs();
    renderPaginationSection();
    renderJobList();
    displayErrorIfEmptyList();
    scrollToJobList();
    afterLoad();
  }

  function saveRecords()
  {
    if(isValid(jobList)===true && isValid(departmentList))
    {
      localStorage.setItem('savedTime', new Date());
      localStorage.setItem('jobList', JSON.stringify(jobList));
      localStorage.setItem('departmentList',JSON.stringify(departmentList));
      localStorage.setItem('locationsList',JSON.stringify(locationsList));
    }
    else
    {
        clearRecords();
    }
  }

  function clearRecords()
  {
    localStorage.clear();
  }

  function displayErrorIfEmptyList()
  {
      var errInfo = document.getElementById("errorInfo");

      if(isValid(jobList)===true)
      {
        errInfo.style.display = "none";
      }
      else
      {
        errInfo.style.display = "block";
      }
  }
  
  function preload()
  {
    var loader = document.getElementById("loader-container");
    loader.style.display = "block";
    var filter = document.getElementById("filterSection");
    filter.style.display = "none";
    var job = document.getElementById("jobSection");
    job.style.display = "none";
  }

function scrollToJobList()
{
    setTimeout(function(){                
    document.getElementById("fullJobContainer")
            .scrollIntoView(true); }, 1000);
}
  
  function afterLoad()
  {    
    var loader = document.getElementById("loader-container");
    loader.style.display = "none";
    var filter = document.getElementById("filterSection");
    filter.style.display = "block";
    var job = document.getElementById("jobSection");
    job.style.display = "block";
 }
  
  function requestFullJobList(apiKey, onload, pageNum)
  {  
    var jobListLink = 'https://api.teamtailor.com/v1/jobs?include=department,locations&page[number]={pageNum}&page[size]=30'; 
    jobListLink = jobListLink.replace('{pageNum}', pageNum);
    //console.log(jobListLink);
    sendRequest(jobListLink, apiKey, function(){
      var data =JSON.parse(this.response);
      if(pageNum == 1)
      {
        var remainPage = data.meta['page-count']-1;
        if(remainPage >0)
        {
          requestCount += remainPage;
          for(var i=0; i<remainPage; i++)
          {
              requestFullJobList(apiKey, onload, i+2);
          }
        }
      }
      if(isValid(data.data)===true && isValid(data.included)===true)
      {
        data.included.filter(d=>d.type==='locations')
          .forEach(l=>{locationsList.push(createLocationInfo(apiKey.type, l))});
        data.included.filter(d=>d.type==='departments')
          .forEach(l=>{departmentList.push(createDepartmentInfo(apiKey.type, l))});
        //must create department/location list before job list
        data.data.forEach(d=>jobList.push(createJobInfo(d)));
      }
      onload();
    });
  }

  function createLocationInfo(regionType, location)
  {
    var info = {region: regionType};
    info.id = location.id;
    info.country = location.attributes.country;
    info.city = location.attributes.city;
    info.name = location.attributes.name;
    return info;
  }
  
  function createDepartmentInfo(regionType, department)
  {
    var info = {region: regionType};
    info.id = department.id;
    info.name = department.attributes.name;
    return info;
  }

  function createJobInfo(job)
  {
    return {
        title: job.attributes.title,
        link: job.links['careersite-job-url'],
        department: getDepartment(job),
        locations: getLocations(job),
      }
  }

  function filterJobs()
  {
    jobList = jobList.filter(info=>{ 
        var match = true;
        if(allQueries.search.has)
        {
          var queries= allQueries.search.arr;
          match &= queries.some((q) => {return searchJob(info, q)});
        }
        if(allQueries.department.has)
        {
          var query= allQueries.department.str;
          match &= info.department === query;
        }
      
        if(allQueries.location.has)
        {
            var query= allQueries.location.id;
            match &= info.locations.some(l=>l.id === query);
        }
        else if(allQueries.country.has)
        {
          var query= allQueries.country.str;
          match &= info.locations.some(l=>l.country === query);
        }
        return match;
    }); 
  }

  function renderFilters()
  {
    renderSearchBar();
    renderDepartmentMenu();
    renderCountryMenu();
    renderCityMenu();
  }

  function renderSearchBar()
  {
    if(allQueries.search.has)
    {
      var searchBar = document.getElementById("search");
      searchBar.value= allQueries.search.str;
    }
  }
  
  function renderDepartmentMenu(){
      //remove depulicate names
      const departments = [...new Map(departmentList
                      .map(item => [item.name, item])).values()];
      var menuId = 'departmentMenu';
      if(allQueries.department.has === true)
      {
        var queryStr = allQueries.department.str;
        var menuTitle = document.getElementById(menuId + 'Title');
        menuTitle.innerHTML = queryStr;
        renderFilterItem(menuId , "All Departments", null);
      }

      departments
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((d)=>{
          renderFilterItem(menuId, d.name, d.name)
      });
  }
  
  function renderCountryMenu(){
      var filteredList = locationsList.filter(location=>{
      var match = true;
      if(allQueries.location.has)
       { match &= location.id === allQueries.location.id;}
      return match;  
      });
      //remove depulicate item
      const countries = [...new Map(filteredList
              .map(item => [item.country, item])).values()];
      var menuId = 'countryMenu';
      if(allQueries.country.has === true)
      {
        var queryStr = allQueries.country.str;
        var menuTitle = document.getElementById(menuId + 'Title');
        menuTitle.innerHTML = queryStr;
        renderFilterItem(menuId, "All Countries");
      }
      
      countries
           .sort((a, b) =>a.country.localeCompare(b.country))
            .forEach((d)=>{
                      renderFilterItem(menuId, 
                          d.country,
                          d.region + "-" + d.country);
      });
  }
  
  function renderCityMenu(){
     var filteredList = locationsList.filter(location=>{
      var match = true;
      if(allQueries.country.has)
       { match &= location.country === allQueries.country.str;}
      return match;  
      });
    
      const cities = [...new Map(filteredList
              .map(item => [item.city, item])).values()];
      var menuId = 'cityMenu';
      if(allQueries.location.has === true)
      {
        var queryStr = allQueries.location.id;
        var found = cities 
                        .filter(d=>d.id === queryStr)[0];
        if(typeof found!=="undefined")
        {
          var menuTitle = document.getElementById(menuId + 'Title');
          menuTitle.innerHTML = found.city;
          renderFilterItem(menuId, "All Cities");
        }
      }
    
      cities
        .sort((a, b) => a.city.localeCompare(b.city))
        .forEach((d)=>{
        renderFilterItem(menuId, d.city, d.region+"-"+d.id);
      });
  }
  
  function renderFilterItem(menuId, menuItem, menuData)
  {
    var li = document.createElement('li'); 
    if(menuData!=null)
      li.setAttribute('data-value', menuData);
    li.appendChild(document.createTextNode(menuItem));
    li.classList.add('dropdown-menu__option', 
                     'js-jobs-filters-dropdown-option', 
                     'u-secondary-background-color');
    var menu = document.getElementById(menuId);
    menu.appendChild(li);
  }
  
function renderPaginationSection()
{
    var section = document.getElementById("paginationSection");
    var totalPages = Math.ceil(jobList.length/numberPerPage);

    if(totalPages == 1) return;
  
    for(var i=1; i<=totalPages; i++)
    {
      var btn = document.createElement('input');
      btn.type = "button";
      btn.value = i;
      btn.classList.add("paging");
      btn.addEventListener('click', function(event,page){
        
     var children = document
                  .getElementById("paginationSection")
                  .children;
      
      [].forEach.call(children, function(child) {
          child.classList.remove("page-active")
        });
        
        var btn = window.event.target;
        btn.classList.add("page-active");
       
        
        currentPage = page; 
        renderJobList();
        }.bind(this, event, i));
      section.appendChild(btn);
    }
}
  
  function ontest(e)
  {
    console.log(e);
    e.preventDefault();
  }
  
function renderJobList()
{  
  var begin = ((currentPage - 1) * numberPerPage);
  var end = begin + numberPerPage;
  
  document.getElementById('jobList').innerHTML = "";
  var pageList = jobList.slice(begin, end);
  pageList.forEach(createJobElement);
}

function searchJob(jobInfo, q)
{
    var qLower = q.toLowerCase();
    var title = jobInfo.title.toLowerCase();
    var department = jobInfo.department.toLowerCase();
    var country = (jobInfo.locations.country || "").toLowerCase();
    var city = jobInfo.locations.map(l=>l.city).toString().toLowerCase();
    var result = title.includes(qLower )||
                      department.includes(qLower)||
                      country.includes(qLower)||
                      city.includes(qLower);
    return result;
}
  
function getDepartment(job)
{
  var departmentData = job.relationships.department.data;
  if(departmentData === null)
    return "";
  
  var departmentid = departmentData.id;
  var type = departmentData.type; 
  var department = departmentList.find(e=>e.id === departmentid);    
  return department.name;
}
  

function getLocations(job)
{
  //locationsData is an array
  var locationsData = job.relationships.locations.data;
  var result = new Array();
  locationsData.forEach((location)=>{
      var id = location.id;
      var type = location.type; 
      var found = locationsList
            .find(element => element.id === id);
    result.push({
      id: found.id,
      country: found.country || "",
      city: found.name || found.city ||""
    });
  })
 
  return result;
}
  
function createJobElement(jobInfo)
{  
  var title = jobInfo.title;
  var link = jobInfo.link;
  var department = jobInfo.department;
  //var country = job.location.country;
  var locations = jobInfo.locations.map(l=>l.city).toString();
  
  var spanTitle = document.createElement('span');
  spanTitle.title = title;
  spanTitle.appendChild(document.createTextNode(title));
spanTitle.classList.add('title', 'u-link-color', 'u-no-hover'); 
  var spanInfo = document.createElement('span');
  
  var infoText = department === ""? locations: department + " - " + locations;  
  spanInfo.appendChild(document.createTextNode(infoText));
spanInfo.classList.add('meta','u-primary-text-color','u-text--small','u-margin-left--auto','col-5');
  
  var div = document.createElement('div'); 
  div.appendChild(spanTitle);
  div.appendChild(spanInfo);
  div.classList.add("row");
  
  var a = document.createElement('a');  
  a.appendChild(div);  
 
  //a.title = link;
  a.href = link; 
  a.classList.add('u-primary-background-color');
    
  var li = document.createElement('li');
  li.appendChild(a);

  document.getElementById('jobList').appendChild(li);
}
  
function sendRequest(link, apiKey, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', link , 'true');
  request.onload = callback; 
  request.setRequestHeader("Authorization", apiKey.key);
  request.setRequestHeader("X-Api-Version","20161108");
  request.send();
}

function isValid(emptyArray)
{
  return typeof emptyArray != "undefined" && emptyArray != null && emptyArray.length != null && emptyArray.length > 0
}
})();
