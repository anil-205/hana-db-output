let tableContent = document.getElementById('table-content')

document.getElementById('file').onchange = function(){
      
    var file = this.files[0];
    var reader = new FileReader();
    let data = {}
    let headers = [];
    const parameters = [
      'HANA REPORT',
      'connection list', 
      'connection list based on client host', 
      'list of suspended connections',
      'Top Suspended statements by connections',
      'Details about suspended transactions',
      'Long running query for last 1 hour, order by duration', 
      'Memory utilization: Used,Allocation',
      'Heap memory details : Pool allocators and their memory usage', 
      'Count of blocking session', 
      'list of blocking sessions',
      'Top SQL by elapsed time - overall', 
      'Top SQLs by elapsed time - ANLIVE', 
      'Top DML SQLs by elapsed time - ANLIVE',
      'Top consumers by memory - overall',
      'Top consumers by memory - ANLIVE',
      'Top DML consumers by memory - ANLIVE',
      'Top consumers by cpu time - overall',
      'Top consumers by cpu time - ANLIVE',
      'Top DML consumers by cpu time - ANLIVE',
      'Top objects in memory - Overall',
      'HANA TENANT SIZE - ANLIVE',
      'BACKUP STATUS',
      'Delta merge failed for below tables in last 1 hour : order by duration/execution_time in ms',
      'Tracefile info in last 1 hour:',
      'HANA TAKOVER History'
    ]

    reader.onload = function(progressEvent){
      // By lines
      var lines = this.result.split('\n');
      parameters.forEach(param => {
        for(var line = 0; line < lines.length; line++) {
          if(lines[line].indexOf(param) !== -1 && param !== 'HANA REPORT' && !data[param]) {
            headers = formatArray(lines[line + 1].split('|'))
            let tableData = [];
            for(var tableLine = line + 3; (lines[tableLine] && lines[tableLine].indexOf('--') === -1); tableLine++) {
              tableData = [...tableData, formatArray(lines[tableLine].split('|'))]
            }
            data[param] = {
              title: param,
              headers,
              tableData,
            }
          } else if(param === 'HANA REPORT' && lines[line].indexOf(param) !== -1) {
            data['mainTitle'] = lines[line].replace(/[*|]/g,'').trim()
          }
        }
      })
      if(Object.keys(data).length === parameters.length) {
        tableContent.innerHTML += mainTemplate(data);
      }                              
    };
    reader.readAsText(file);

    function formatArray(items) {
      let tableContent = [];
      items.forEach(item => {
        if(item.trim() !== '') {
          tableContent.push(item.trim())
        }
      })
      return tableContent;
    }
  };

  function mainTemplate(data = {}) {

    var table =  Object.keys(data).map((param, i) => tableTemplate(param, data));
    var tableHtml = replaceCommaInString(table);
      return (`
        <div className="main-content">
            <h3>${data['mainTitle']}</h3>
             ${tableHtml}
        </div>
      `);
  }

  function replaceCommaInString (arrayOfString = []) {
    return arrayOfString.toString().replace(/\,/g, '');
  }

  function tableTemplate(param, data = {}) {
          
    var title = data[param].title;
    if(title) {
        var headerData = data && data[param] && data[param].headers && data[param].headers.length && data[param].headers || [];

     var bodyData = data && data[param] && data[param].tableData && data[param].tableData.length && data[param].tableData || [];
    
     var TableHeader = (header) => `<th>${header}</th>`;

     var headerTH = ()=> headerData.map(TableHeader);

     var TableDefinition = (defValue) => `<td>${defValue}</td>`;

     var TableDefinitions = (cells) => {

           if(!cells || !cells.length)
           return [];

           return cells.map(TableDefinition);
       }

     var TableRow = (row) => {
         var cells =  replaceCommaInString(TableDefinitions(row));
         return    `<tr> ${cells} </tr>`;
     };

     var TableRows = (tableRowData) => {
         return tableRowData.map(TableRow);
   }

     var headerHTml = replaceCommaInString(headerTH(headerData));
     var bodyHtml = replaceCommaInString(TableRows(bodyData));
    
     return (`
       <div>
       <h4>${title}</h4>
       <table>
           <thead>
               <tr>
                   ${headerHTml}
               </tr>
           </thead>
           <tbody>
               ${bodyHtml}
           </tbody>
       </table>
       </div>
     `);
    }
     
 }