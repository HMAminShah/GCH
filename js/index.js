var url = "https://api.data.pldn.nl/datasets/GeoCourseHub/GCH/sparql";
function populateOption(){
    
    document.getElementById("searchInput").value = '';
    var specializationRadio = document.getElementById("specialization");
    var topicsRadio = document.getElementById("topics");

    var query_topics = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                        'prefix gch: <http://gch.utwente.nl/ontology#>'+
                        'prefix xsd: <http://www.w3.org/2001/XMLSchema#>'+
                        'SELECT distinct ?name WHERE {'+

                        '  ?course gch:OSIRISNumber ?osirisnum;'+
                        '      rdfs:label ?label;'+
                        '      gch:hasSubject ?subje.'+
                        '  ?subje rdfs:label ?name.'+
                        '}';


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
        console.log("Selected value: " + specializationRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {
        console.log("Selected value: " + topicsRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topics) + "&format=json";
    }

    //queryUrl_menu = url + "?query=" + encodeURIComponent(query_topics) + "&format=json";
    console.log(queryUrl_menu);
        
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

    var query_topic =  'Prefix skos: <http://www.w3.org/2004/02/skos/core#>\
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                        prefix gch: <http://gch.utwente.nl/ontology#>\
                        prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                        SELECT distinct ?concept ?narrower_concept ?close_concepts ?related_concept ?Name WHERE {\
                        ?course gch:hasSubject ?topic.\
                        ?topic rdfs:label "'+topic+'"@en, ?concept;\
                        rdfs:label ?coursename.\
                        ?course rdfs:label ?Name;\
                        optional { ?topic skos:narrower ?narrower.\
                                ?narrower rdfs:label ?narrower_concept}\
                        optional { ?topic skos:closeMatch ?close.\
                                    ?close rdfs:label ?close_concepts.   }\
                        optional { ?topic skos:related ?related. \
                                    ?related rdfs:label ?related_concept. }\
                        \
                        }'
    
    var query_special =    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                            prefix gch: <http://gch.utwente.nl/ontology#>\
                            prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                            SELECT distinct ?concept ?Name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff (REPLACE(STR(xsd:date(?Course_start_d)), "Z", "") AS ?Course_start_date) (REPLACE(STR(xsd:date(?Course_end_d)), "Z", "") AS ?Course_end_date) ?ITC_quertile ?UT_quertile WHERE {\
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
                                    gch:quartileITC ?ITC_quertile;\
                                    gch:quartileUT ?UT_quertile.\
                                optional {?course gch:hasSubject ?sub.\
                                        ?sub rdfs:label ?Course_concepts.\
                            }\
                            ?special rdfs:label "'+topic+'"@en, ?concept.\
                            }'

    var queryUrl_menu; 
    if (specializationRadio.checked) {
        console.log("Selected value: " + specializationRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {
        console.log("Selected value: " + topicsRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topic) + "&format=json";
    }
    
    $.ajax({
        dataType: "json",
        url: queryUrl_menu,
        success: function (data1) {
           
            create_network_graph(data1);

            
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
    // Example: Log the clicked topic to the console
    console.log("Clicked topic: " + topic);
    network_graph(topic);
    get_table_data(topic);
    // Call your other function with additional functionality here
    // For example: yourFunction(topic);
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

    // Iterate through each JSON object in the array
    jsonData.forEach(function(item) {
        // Add concept node if not already added
        if (!concepts[item.concept]) {
            var conceptNode = {
                id: item.concept,
                label: insertLineBreaks(item.concept),
                level: 2
            };
            nodes.push(conceptNode);
            concepts[item.concept] = true;
        }

        // Add name node if not already added
        if (!nodes.find(node => node.id === item.Name)) {
            var nameNode = {
                id: item.Name,
                label: insertLineBreaks(item.Name),
                level: 3
            };
            nodes.push(nameNode);
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
                    border: '#0000ff', // Set border color to blue
                    background: '#aaaaff', // Set background color to light blue
                    highlight: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    },
                    hover: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    }
                }
            };
            nodes.push(narrowerConceptNode);

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
                    border: '#0000ff', // Set border color to blue
                    background: '#aaaaff', // Set background color to light blue
                    highlight: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    },
                    hover: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    }
                }
            };
            nodes.push(close_conceptsNode);

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
                    border: '#0000ff', // Set border color to blue
                    background: '#aaaaff', // Set background color to light blue
                    highlight: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    },
                    hover: {
                        border: '#0000ff',
                        background: '#aaaaff'
                    }
                }
            };
            nodes.push(relatedConceptNode);

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
        nodes: {
            shape: 'box',
            shapeProperties: {
                borderRadius: 0
            },
            font: {
                multi: true
            }
        },
        edges: {
            arrows: 'to'
        }
    };

    var network = new vis.Network(container, data, options);

    // Add event listener for node clicks
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            var clickedNodeId = params.nodes[0]; // Assuming only one node can be clicked at a time
            var clickedNodeLabel = nodes.find(node => node.id === clickedNodeId).label;
            console.log(clickedNodeLabel); // Return the label of the clicked node
            highlightTableRowByName(clickedNodeLabel);
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
                        'SELECT DISTINCT ?Course_name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff ?formatted_start_date ?formatted_end_date ?ITC_quertile ?UT_quertile WHERE {'+
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
                                'gch:quartileITC ?ITC_quertile;'+
                                'gch:quartileUT ?UT_quertile.'+
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
                            SELECT distinct ?concept ?Name ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff (REPLACE(STR(xsd:date(?Course_start_d)), "Z", "") AS ?Course_start_date) (REPLACE(STR(xsd:date(?Course_end_d)), "Z", "") AS ?Course_end_date) ?ITC_quertile ?UT_quertile WHERE {\
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
                                    gch:quartileITC ?ITC_quertile;\
                                    gch:quartileUT ?UT_quertile.\
                                optional {?course gch:hasSubject ?sub.\
                                        ?sub rdfs:label ?Course_concepts.\
                            }\
                            ?special rdfs:label "'+topic+'"@en, ?concept.\
                            }'

    var queryUrl_menu; 
    if (specializationRadio.checked) {
        console.log("Selected value: " + specializationRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_special) + "&format=json";
    } else if (topicsRadio.checked) {
        console.log("Selected value: " + topicsRadio.value);
        queryUrl_menu = url + "?query=" + encodeURIComponent(query_topic) + "&format=json";
    }
    
    $.ajax({
        dataType: "json",
        url: queryUrl_menu,
        success: function (data1) {

            console.log(JSON.stringify(data1));
            tab_data = processJSON_table(data1);
            console.log(tab_data);
           
            create_table(tab_data);

            
        }
    });

};

//This function is creating the table from the following json data: 
function create_table(data) {

    var table = document.createElement("table");
    var headerRow = table.insertRow(0);
    
    // Create table headers, skipping the "name", "credits", "hours", and "week" columns
    for (var key in data[0]) {
        if (key !== "concept"){
            var headerCell = document.createElement("th");
            headerCell.textContent = key.replaceAll('_', ' ');
            headerRow.appendChild(headerCell);
        }
            
    }
    
    // Populate table rows, skipping the "name", "credits", "hours", and "week" columns
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(i + 1);
        for (var key in data[i]) {
            if (key !== "concept"){
                var cell = row.insertCell();
                cell.textContent = data[i][key];
            }
                
        }
    }

    var container = document.getElementById("table-data");
    container.innerHTML = '';
    container.appendChild(table)
    
}

function highlightTableRowByName(name) {
    name = name.replaceAll('\n', ' ');
    console.log(name);
    var tableRows = document.querySelectorAll("#table-data table tr");
    tableRows.forEach(function(row) {
        var nameCell = row.querySelector("td:first-child"); // Assuming the first cell contains the name
        if (nameCell && nameCell.textContent.trim() === name.trim()) {
            console.log('inside check')
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
        const osirisNumber = entry.OSIRIS_number;
        
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
