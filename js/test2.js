var url = "https://api.data.pldn.nl/datasets/GeoCourseHub/GCH/sparql";
function populateOption(){
    document.getElementById("searchInput").value = '';
    var specializationRadio = document.getElementById("specialization");
    var topicsRadio = document.getElementById("topics");

    var org_chart_div = document.querySelector('#org-chart').innerHTML = '';
    
    var container = document.getElementById("table-data");
    var tableElement = container.querySelector('table'); // Remove the already existing table
    if (tableElement){
        container.removeChild(tableElement);
    }

    var elements = document.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].innerText = 'Select a concept or specialization'
        elements[i].style.display = 'block'; // For example, hide the element
    }

    document.getElementById('legend-image').style.display = 'none';

    var query_topics = 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>\
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                        PREFIX gch: <http://gch.utwente.nl/ontology#>\
                        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\
                        select distinct ?name where {\
                        ?s ?p skos:Concept;\
                            rdfs:label ?name.\
                        }';


    var query_special = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                        'prefix gch: <http://gch.utwente.nl/ontology#>'+
                        'prefix xsd: <http://www.w3.org/2001/XMLSchema#>'+
                        'SELECT distinct ?name WHERE {'+
                        '    ?course gch:isPartOfSpecialisation ?special.'+
                        '    ?special rdfs:label ?name.'+
                        '    }';
    
    var queryUrl_menu; 
    if (specializationRadio.checked) {
        document.getElementById('topic-name').innerText = 'Specialization:'
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {

        document.getElementById('topic-name').innerText = 'Concept:'
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topics) + "&format=json";
    }
        
    $.ajax({
            dataType: "json",
            url: queryUrl_menu,
            success: function (data) {

                var serach_list = [];
                for(let i=0; i<data.length;i++){
                    serach_list.push(data[i]['name'])
                };
                populateTopicList(serach_list);
            }
        });

}

function network_graph(topic){

    var specializationRadio = document.getElementById("specialization");
    var topicsRadio = document.getElementById("topics");

    var query_topic =   'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>'+
                        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                        'PREFIX gch: <http://gch.utwente.nl/ontology#>'+
                        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'+
                        'SELECT DISTINCT ?concept ?narrower_concept ?close_concepts ?related_concept'+ 
                                        '(IF(bound(?OSIRIS_number), ?Names, "") AS ?Name)'+
                                        '?OSIRIS_number'+
                        'WHERE {'+
                        '?course gch:hasSubject ?topic.'+
                        '?topic rdfs:label "'+topic+'"@en, ?concept.'+
                        '?course rdfs:label ?Names.'+
                        'OPTIONAL { '+
                            '?course gch:OSIRISNumber ?OSIRIS_number.'+
                            'FILTER(!bound(?OSIRIS_number) || bound(?Names))'+
                        '}'+
                        'OPTIONAL { '+
                            '?topic skos:narrower ?narrower.'+
                            '?narrower rdfs:label ?narrower_concept'+
                        '}'+
                        'OPTIONAL { '+
                            '?topic skos:closeMatch ?close.'+
                            '?close rdfs:label ?close_concepts.'+
                        '}'+
                        'OPTIONAL { '+
                            '?topic skos:related ?related.'+ 
                            '?related rdfs:label ?related_concept. '+
                        '}'+
                        '}'
    
    var query_special =    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                            prefix gch: <http://gch.utwente.nl/ontology#>\
                            prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                            SELECT distinct ?concept ?Name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff (REPLACE(STR(xsd:date(?Course_start_d)), "Z", "") AS ?Course_start_date) (REPLACE(STR(xsd:date(?Course_end_d)), "Z", "") AS ?Course_end_date) ?ITC_quartile ?UT_quartile WHERE {\
                            ?course gch:isPartOfSpecialisation ?special;\
                                    rdfs:label ?Name;\
                                gch:credits ?Credits;\
                                    gch:durationHours ?Course_duration_in_hours;\
                                    gch:durationWeeks ?Course_duration_in_weeks;\
                                    gch:OSIRISNumber ?OSIRIS_number;\
                                    gch:courseNumber ?Course_number;\
                                    gch:startDate ?Course_start_d;\
                                    gch:endDate ?Course_end_d;\
                                    gch:numberOfStaff ?Number_of_staff;\
                                    gch:quartileITC ?ITC_quartile;\
                                    gch:quartileUT ?UT_quartile.\
                                optional {?course gch:hasSubject ?sub.\
                                        ?sub rdfs:label ?Course_concepts.\
                            }\
                            ?special rdfs:label "'+topic+'"@en, ?concept.\
                            }'

    var queryUrl_menu; 
    if (specializationRadio.checked) {
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topic) + "&format=json";
    }
    
    $.ajax({
        dataType: "json",
        url: queryUrl_menu,
        success: function (data1) {
            if (data1.length != 0){
                create_network_graph(data1);
            }
            else{
                alert('No Data for the selected option')
            }
        }
    });
};
        

// Create the list of choice in the sidebar


// Function to populate the list
function populateTopicList(topics) {
    var topicList = document.getElementById("topic-list");
    // Clear existing list items
    topicList.innerHTML = "";
    // Sort topics alphabetically
    topics = topics.map(item => item.trim())
    topics.sort();
    // Populate the list
    topics.forEach(function(topic) {
        var listItem = document.createElement("li");
        var span = document.createElement("span"); // Create a <span> element
        span.textContent = topic; // Set the text content of the span
        listItem.addEventListener("click", function() {
            handleListItemClick(topic);
        });
        listItem.appendChild(span); // Append the span to the list item
        topicList.appendChild(listItem);
    });
}

function handleListItemClick(topic) {
    network_graph(topic);
    get_table_data(topic);
}

// Add the functionality for filter in sidebar course options
document.getElementById("searchInput").addEventListener("input", function() {
    var searchTerm = this.value.toLowerCase();
    var listItems = document.getElementById("topic-list").getElementsByTagName("li");
    // Loop through list items and hide those that don't match the search term
    for (var i = 0; i < listItems.length; i++) {
        var listItemText = listItems[i].textContent.toLowerCase();
        if (listItemText.indexOf(searchTerm) > -1) {
            listItems[i].style.display = "block";
        } else {
            listItems[i].style.display = "none";
        }
    }
});
       

function create_network_graph(jsonData) {
    var container = document.getElementById('org-chart');
    document.getElementById('legend-image').style.display = 'block'; // To display legend on chart display only
    var parentDiv = document.querySelector('.sub-upper');
    var elements = parentDiv.querySelectorAll('.initial-text');

    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none'; // For example, hide the element
    }

    // Function to insert line breaks after every two words in the text
    function insertLineBreaks(text) {
        var words = text.split(' ');
        var result = '';
        for (var i = 0; i < words.length; i += 2) {
            result += words[i] + ' ' + (words[i + 1] || '') + '\n';
        }
        return result;
    }

    // Transform JSON data into nodes and edges
    var nodes = [];
    var edges = [];
    var concepts = {};

    function addUniqueNode(node) {
        if (!nodes.find(existingNode => existingNode.id === node.id)) {
            nodes.push(node);
        }
    }

    // Iterate through each JSON object in the array
    jsonData.forEach(function(item) {
        // Add concept node if not already added
        if (!concepts[item.concept]) {
            var conceptNode = {
                id: item.concept,
                label: insertLineBreaks(item.concept),
                level: 2
            };
            addUniqueNode(conceptNode);
            // nodes.push(conceptNode);
            concepts[item.concept] = true;
        }

        // Add name node if not already added
        if (item.Name && !nodes.find(node => node.id === item.Name)) {
            var nameNode = {
                id: item.Name,
                label: insertLineBreaks(item.Name),
                level: 3,
                color: {
                    border: '#000000', // Set border color to blue
                    background: '#bff5b8', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#bff5b8'
                    },
                    hover: {
                        border: '#000000',
                        background: '#bff5b8',
                    },
                    
                }
            };
            addUniqueNode(nameNode);
            // nodes.push(nameNode);
        }

        // Add edges between concept and name nodes
        edges.push({ from: item.concept, to: item.Name });

        // Add narrower concept node if exists
        if (item.narrower_concept && !nodes.find(node => node.id === item.narrower_concept)) {
            var narrowerConceptNode = {
                id: item.narrower_concept,
                label: insertLineBreaks(item.narrower_concept),
                level: 1,
                shape: 'ellipse',
                color: {
                    border: '#000000', // Set border color to blue
                    background: '#f5d57f', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#f5d57f'
                    },
                    hover: {
                        border: '#000000',
                        background: '#f5d57f',
                    },
                    
                }
            };
            addUniqueNode(narrowerConceptNode);
            // nodes.push(narrowerConceptNode);

            // Add edge between concept and narrower concept
            edges.push({ from: item.concept, to: item.narrower_concept });
        }

        // Add close concepts nodes if exists
        if (item.close_concepts && !nodes.find(node => node.id === item.close_concepts)) {
            var close_conceptsNode = {
                id: item.close_concepts,
                label: insertLineBreaks(item.close_concepts),
                level: 1,
                shape: 'ellipse',
                color: {
                    border: '#000000', // Set border color to blue
                    background: '#f5cbe3', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#f5cbe3'
                    },
                    hover: {
                        border: '#000000',
                        background: '#f5cbe3'
                    },
                    
                }
            };
            addUniqueNode(close_conceptsNode);
            // nodes.push(close_conceptsNode);

            // Add edge between concept and narrower concept
            edges.push({ from: item.concept, to: item.close_concepts});
        }

        // Add related concept node if exists
        if (item.related_concept && !nodes.find(node => node.id === item.related_concept)) {
            var relatedConceptNode = {
                id: item.related_concept,
                label: insertLineBreaks(item.related_concept),
                level: 1,
                shape: 'ellipse',
                color: {
                    border: '#000000', // Set border color to blue
                    background: '#d2aaf0', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#d2aaf0'
                    },
                    hover: {
                        border: '#000000',
                        background: '#d2aaf0'
                    },
                    
                }
            };
            addUniqueNode(relatedConceptNode);
            // nodes.push(relatedConceptNode);

            // Add edge between concept and related concept
            edges.push({ from: item.concept, to: item.related_concept });
        }
    });

    var data = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    var options = {
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed'
            }
        },
        physics: {
            enabled: true,
            hierarchicalRepulsion: {
                nodeDistance: 200, // Adjust this value to control the distance between nodes
            },
            solver: 'repulsion'
        },
        interaction: {
            hover: true // Enable hover interactions
        },
        nodes: {
            shape: 'box',
            shapeProperties: {
                borderRadius: 0
            },
            font: {
                multi: true
            },
            hover: {
                // Change cursor to pointer when hovering over nodes
                mode: 'pointer'
            }
        },
        edges: {
            arrows: 'to'
        },
        
    };

    var network = new vis.Network(container, data, options);

    // Add event listener for node clicks
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            var clickedNodeId = params.nodes[0]; // Assuming only one node can be clicked at a time
            var clickedNodeLabel = nodes.find(node => node.id === clickedNodeId).label;

            highlightTableRowByName(clickedNodeLabel);
        }
        else{
            var tableRows = document.querySelectorAll("#table-data table tr");
            tableRows.forEach(function(row) {
                    row.classList.remove("highlighted-row");
            });
        }
    });
    
}

function get_table_data(topic){

    var specializationRadio = document.getElementById("specialization");
    var topicsRadio = document.getElementById("topics");

    var query_topic =  'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                        'PREFIX gch: <http://gch.utwente.nl/ontology#>'+
                        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'+
                        'SELECT DISTINCT ?course ?Course_name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff ?formatted_start_date ?formatted_end_date ?ITC_quartile ?UT_quartile WHERE {'+
                        '?course gch:hasSubject ?topic.'+
                        '?topic rdfs:label "'+topic+'"@en.'+
                        '?course rdfs:label ?Course_name;'+
                                'gch:credits ?Credits;'+
                                'gch:durationHours ?Course_duration_in_hours;'+
                                'gch:durationWeeks ?Course_duration_in_weeks;'+
                                'gch:OSIRISNumber ?OSIRIS_number;'+
                                'gch:courseNumber ?Course_number;'+
                                'gch:startDate ?start_date;'+
                                'gch:endDate ?end_date;'+
                                'gch:numberOfStaff ?Number_of_staff;'+
                                'gch:quartileITC ?ITC_quartile;'+
                                'gch:quartileUT ?UT_quartile.'+
                        'BIND(CONCAT('+
                                'SUBSTR(STR(?start_date), 9, 2), "-", '+
                                'SUBSTR(STR(?start_date), 6, 2), "-", '+
                                'SUBSTR(STR(?start_date), 1, 4)) AS ?formatted_start_date)'+
                        'BIND(CONCAT('+
                                'SUBSTR(STR(?end_date), 9, 2), "-", '+
                                'SUBSTR(STR(?end_date), 6, 2), "-", '+
                                'SUBSTR(STR(?end_date), 1, 4)) AS ?formatted_end_date)'+
                        '}';
    
    var query_special =    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                            prefix gch: <http://gch.utwente.nl/ontology#>\
                            prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                            SELECT distinct ?course ?concept ?Name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff (REPLACE(STR(xsd:date(?Course_start_d)), "Z", "") AS ?Course_start_date) (REPLACE(STR(xsd:date(?Course_end_d)), "Z", "") AS ?Course_end_date) ?ITC_quartile ?UT_quartile WHERE {\
                            ?course gch:isPartOfSpecialisation ?special;\
                                    rdfs:label ?Name;\
                                gch:credits ?Credits;\
                                    gch:durationHours ?Course_duration_in_hours;\
                                    gch:durationWeeks ?Course_duration_in_weeks;\
                                    gch:OSIRISNumber ?OSIRIS_number;\
                                    gch:courseNumber ?Course_number;\
                                    gch:startDate ?Course_start_d;\
                                    gch:endDate ?Course_end_d;\
                                    gch:numberOfStaff ?Number_of_staff;\
                                    gch:quartileITC ?ITC_quartile;\
                                    gch:quartileUT ?UT_quartile.\
                                optional {?course gch:hasSubject ?sub.\
                                        ?sub rdfs:label ?Course_concepts.\
                            }\
                            ?special rdfs:label "'+topic+'"@en, ?concept.\
                            }'

    var queryUrl_menu; 
    if (specializationRadio.checked) {
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topic) + "&format=json";
    }
    
    $.ajax({
        dataType: "json",
        url: queryUrl_menu,
        success: function (data1) {
            
            if (data1.length != 0){
                var elements = document.querySelectorAll('.initial-text');
                // Loop through each selected element
                for (var i = 0; i < elements.length; i++) {
                    // Apply your desired styles to each element
                    elements[i].innerText = 'Select a concept or specialization' // For example, hide the element
                }
                tab_data = processJSON_table(data1);
                create_table(tab_data);
            }
            else{
                var container = document.getElementById("table-data");

                var tableElement = container.querySelector('table'); // Remove the already existing table
                if (tableElement){
                    container.removeChild(tableElement);
                    
                }
                var elements = container.querySelectorAll('.initial-text');
                // Loop through each selected element
                for (var i = 0; i < elements.length; i++) {
                    // Apply your desired styles to each element
                    elements[i].innerText = 'No Course associated with this concept'
                    elements[i].style.display = 'block'
                        // For example, hide the element
                }
                
            }
        }
    });

};

//This function is creating the table from the following json data: 
function create_table(data) {

    // var table = document.createElement("table");
    // // var headerRow = table.insertRow(0);
    // var thead = document.createElement('thead')
    // table.appendChild(thead);
    
    // var headerRow = thead.insertRow(0);

    // // Create table headers, skipping the "name", "credits", "hours", and "week" columns
    // for (var key in data[0]) {
    //     if (key !== "concept" && key !== "course"){
    //         var headerCell = document.createElement("th");
    //         headerCell.textContent = key.replaceAll('_', ' ');
    //         headerRow.appendChild(headerCell);
    //     }
            
    // }
    
    // // Populate table rows, skipping the "name", "credits", "hours", and "week" columns
    // for (var i = 0; i < data.length; i++) {
    //     var row = table.insertRow(i + 1);
    //     for (var key in data[i]) {
    //         if (key !== "concept" && key !== "course"){
    //             var cell = row.insertCell();
    //             cell.textContent = data[i][key];
    //         }
                
    //     }
    // }

    var table = document.createElement("table");

    // Create thead element and append it to the table
    var thead = document.createElement("thead");
    table.appendChild(thead);

    // Create header row and append it to the thead
    var headerRow = thead.insertRow(0);

    // Create table headers, skipping the "concept" and "course" columns
    for (var key in data[0]) {
        if (key !== "concept" && key !== "course") {
            var headerCell = document.createElement("th");
            headerCell.textContent = key.replaceAll('_', ' ');
            headerRow.appendChild(headerCell);
        }
    }

    var tbody = document.createElement("tbody");
    table.appendChild(tbody);

    // Populate table rows, skipping the "concept" and "course" columns
    for (var i = 0; i < data.length; i++) {
        var row = tbody.insertRow(i);
        for (var key in data[i]) {
            if (key !== "concept" && key !== "course") {
                var cell = row.insertCell();
                cell.textContent = data[i][key];

            }
        }
    }


    var container = document.getElementById("table-data");

    var elements = container.querySelectorAll('.initial-text');

    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = 'none';
    }

    var tableElement = container.querySelector('table'); // Remove the already existing table
    if (tableElement){
        container.removeChild(tableElement);
    }
    
    container.appendChild(table)
    
}

function highlightTableRowByName(name) {
    name = name.replaceAll('\n', ' ');

    var tableRows = document.querySelectorAll("#table-data table tr");
    tableRows.forEach(function(row) {
        var nameCell = row.querySelector("td:first-child"); // Assuming the first cell contains the name
        if (nameCell && nameCell.textContent.trim().includes(name.trim()) ) {
            row.classList.add("highlighted-row"); // Add a class to highlight the row
        } else {
            row.classList.remove("highlighted-row"); // Remove the class from other rows
        }
    });


}


function processJSON_table(jsonData) {
    const processedData = {};
    
    // Process each entry in the JSON data
    jsonData.forEach(entry => {
        const osirisNumber = entry.course;
        
        // If the OSIRIS number is not in processedData, add it
        if (!processedData[osirisNumber]) {
            processedData[osirisNumber] = entry;
        } else {
            // Merge repeated information with commas
            Object.keys(entry).forEach(key => {
                if (processedData[osirisNumber][key] !== entry[key]) {
                    processedData[osirisNumber][key] += ', ' + entry[key];
                }
            });
        }
    });
    
    // Return the values of the processedData object
    return Object.values(processedData);
}

populateOption()
document.getElementById("specialization").addEventListener("change", populateOption);
document.getElementById("topics").addEventListener("change", populateOption);
