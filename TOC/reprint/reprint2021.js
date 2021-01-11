var column_names = ["Reprint Date","Series","Vol(s)"];
var clicks = {reprint: 0, series: 0, vol: 0};

// draw the table
d3.select("#page-wrap").append("div")
  .attr("id", "container")

d3.select("#container").append("div")
  .attr("id", "FilterableTable");

d3.select("#FilterableTable").append("div")
  .attr("class", "SearchBar")
  .append("p")
    .attr("class", "SearchBar")
    .text("Search By Series:");

d3.select(".SearchBar")
  .append("input")
    .attr("class", "SearchBar")
    .attr("id", "search")
    .attr("type", "text")
    .attr("placeholder", "Search...");
  
var table = d3.select("#FilterableTable").append("table");
table.append("thead").append("tr"); 

var headers = table.select("tr").selectAll("th")
    .data(column_names)
  .enter()
    .append("th")
    .text(function(d) { return d; });

var rows, row_entries, row_entries_no_anchor, row_entries_with_anchor;

var dropbox_json = "https://dl.dropboxusercontent.com/s/1i16zc2ci9rl9pu/data2021.json?dl=1"
  
d3.json(dropbox_json, function(data) { // loading data from server
  
  // draw table body with rows
  table.append("tbody")

  // data bind
  rows = table.select("tbody").selectAll("tr")
    .data(data, function(d){ return d.id; });
  
  // enter the rows
  rows.enter()
    .append("tr")
  
  // enter td's in each row
  row_entries = rows.selectAll("td")
      .data(function(d) { 
        var arr = [];
        for (var k in d) {
          if (d.hasOwnProperty(k)) {
		    arr.push(d[k]);
          }
        }
	parseDate = d3.time.format("%Y-%m-%d").parse
	formatDate = d3.time.format("%d-%b")
        return [formatDate(parseDate(arr[0])),arr[1],arr[2]];
      })
    .enter()
      .append("td") 

  // draw row entries with no anchor 
  row_entries_no_anchor = row_entries.filter(function(d) {
    return (/https?:\/\//.test(d) == false)
  })
  row_entries_no_anchor.text(function(d) { return d; })

  // draw row entries with anchor
  row_entries_with_anchor = row_entries.filter(function(d) {
    return (/https?:\/\//.test(d) == true)  
  })
  row_entries_with_anchor
    .append("a")
    .attr("href", function(d) { return d; })
    .attr("target", "_blank")
  .text(function(d) { return d; })
    
    
  /**  search functionality **/
    d3.select("#search")
      .on("keyup", function() { // filter according to key pressed 
        var searched_data = data,
            text = this.value.trim();
        
        var searchResults = searched_data.map(function(r) {
          var regex = new RegExp(text + ".*", "i");
          if (regex.test(r.series)) { // if there are any results
            return regex.exec(r.series)[0]; // return them to searchResults
          } 
        })
	    
	    // filter blank entries from searchResults
        searchResults = searchResults.filter(function(r){ 
          return r != undefined;
        })
        
        // filter dataset with searchResults
        searched_data = searchResults.map(function(r) {
           return data.filter(function(p) {
            return p.series.indexOf(r) != -1;
          })
        })

        // flatten array 
		searched_data = [].concat.apply([], searched_data)
        
        // data bind with new data
		rows = table.select("tbody").selectAll("tr")
		  .data(searched_data, function(d){ return d.id; })
		
        // enter the rows
        rows.enter()
         .append("tr");
         
        // enter td's in each row
        row_entries = rows.selectAll("td")
            .data(function(d) { 
              var arr = [];
              for (var k in d) {
                if (d.hasOwnProperty(k)) {
		          arr.push(d[k]);
                }
              }
	parseDate = d3.time.format("%Y-%m-%d").parse
	formatDate = d3.time.format("%d-%b")
        return [formatDate(parseDate(arr[0])),arr[1],arr[2]];
            })
          .enter()
            .append("td") 

        // draw row entries with no anchor 
        row_entries_no_anchor = row_entries.filter(function(d) {
          return (/https?:\/\//.test(d) == false)
        })
        row_entries_no_anchor.text(function(d) { return d; })

        // draw row entries with anchor
        row_entries_with_anchor = row_entries.filter(function(d) {
          return (/https?:\/\//.test(d) == true)  
        })
        row_entries_with_anchor
          .append("a")
          .attr("href", function(d) { return d; })
          .attr("target", "_blank")
        .text(function(d) { return d; })
        
        // exit
        rows.exit().remove();
      })
    
  /**  sort functionality **/
  headers
    .on("click", function(d) {
      if (d == "Series") {
        clicks.series++;
        // even number of clicks
        if (clicks.series % 2 == 0) {
          // sort ascending: alphabetically
          rows.sort(function(a,b) { 
            if (a.series.toUpperCase() < b.series.toUpperCase()) { 
              return -1; 
            } else if (a.series.toUpperCase() > b.series.toUpperCase()) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.series % 2 != 0) { 
          // sort descending: alphabetically
          rows.sort(function(a,b) { 
            if (a.series.toUpperCase() < b.series.toUpperCase()) { 
              return 1; 
            } else if (a.series.toUpperCase() > b.series.toUpperCase()) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }
      } 
      if (d == "Reprint Date") {
        clicks.reprint++;
        if (clicks.reprint % 2 == 0) {
          // sort ascending: by date
          rows.sort(function(a,b) { 
            // grep date and time, split them apart, make Date objects for comparing  
	        var date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(a.reprint);
	        date = date[0].split("-"); 
	        var a_date_obj = new Date(+date[0],(+date[1]-1),+date[2]);
          
            date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(b.reprint);
	        date = date[0].split("-"); 
	        var b_date_obj = new Date(+date[0],(+date[1]-1),+date[2]);
			          
            if (a_date_obj < b_date_obj) { 
              return -1; 
            } else if (a_date_obj > b_date_obj) { 
              return 1; 
            } else {
              return 0;
            }
          });
        // odd number of clicks  
        } else if (clicks.reprint % 2 != 0) { 
          // sort descending: by date
          rows.sort(function(a,b) { 
            // grep date and time, split them apart, make Date objects for comparing  
	        var date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(a.reprint);
	        date = date[0].split("-"); 
	        var a_date_obj = new Date(+date[0],(+date[1]-1),+date[2]);
          
            date = /[\d]{4}-[\d]{2}-[\d]{2}/.exec(b.reprint);
	        date = date[0].split("-"); 
	        var b_date_obj = new Date(+date[0],(+date[1]-1),+date[2]);
			          
            if (a_date_obj < b_date_obj) { 
              return 1; 
            } else if (a_date_obj > b_date_obj) { 
              return -1; 
            } else {
              return 0;
            }
          });
        }
      }
     
    }) // end of click listeners
});
d3.select(self.frameElement).style("height", "780px").style("width", "1150px");	
