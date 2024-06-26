var url = "https://api.data.pldn.nl/datasets/GeoCourseHub/GCH/sparql";

var query_course =  'Prefix skos: <http://www.w3.org/2004/02/skos/core#>'+
                    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                    'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                    'prefix gch: <http://gch.utwente.nl/ontology#>'+
                    'prefix xsd: <http://www.w3.org/2001/XMLSchema#>'+

                    'select distinct ?name where {'+
                    '?course gch:OSIRISNumber ?number.'+
                    '?course rdfs:label ?name.'+
                    '}'

var queryUrl_course = url + "?query=" + encodeURIComponent(query_course) + "&format=json";

$.ajax({
    dataType: "json",
    url: queryUrl_course,
    success: function (data) {


        var serach_list = [];
        for(let i=0; i<data.length;i++){

            serach_list.push(data[i]['name'])
        };

        populateTopicList(serach_list);

    }
});

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
    if (topic === 'Data Assimilation'){
        topic = 'Data Assimilation '
    }
    var concept_graph = document.getElementById('concept-graph')
    if (concept_graph !== null){
        document.getElementById('sub-lower').removeChild(concept_graph);
    }
    
    data_for_graph(topic);
    table_data(topic);
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


function data_for_graph(course_name){

    var query_nodes =  'Prefix skos: <http://www.w3.org/2004/02/skos/core#>\
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                        prefix gch: <http://gch.utwente.nl/ontology#>\
                        prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                        \
                        SELECT distinct ?name\
                        (COALESCE(?Didactic, false) AS ?Didactic_Approach)\
                        (COALESCE(?LearningOutcomes, false) AS ?Learning_outcomes)\
                        (COALESCE(?LearningUnit, false) AS ?Learning_Units)\
                        (COALESCE(?Prerequisite, false) AS ?Prerequisite_comments)\
                        (COALESCE(?PrerequisiteCourse, false) AS ?Prerequisite_courses)\
                        (COALESCE(?Softwares, false) AS ?Software)\
                        (COALESCE(?Programs, false) AS ?Program)\
                        (COALESCE(?Concept, false) AS ?Concepts)\
                        \
                        WHERE {\
                        ?course rdfs:label "'+course_name+'"@en, ?name.\
                        \
                        OPTIONAL {\
                            ?course gch:hasDidacticalApproachComment ?approach.\
                            BIND(IF(BOUND(?approach), true, false) AS ?Didactic)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:hasLearningOutcome ?loutcome.\
                            BIND(IF(BOUND(?loutcome), true, false) AS ?LearningOutcomes)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:hasLearningUnit ?lunit.\
                            BIND(IF(BOUND(?lunit), true, false) AS ?LearningUnit)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:hasPrerequisiteComment ?preqcom.\
                            BIND(IF(BOUND(?preqcom), true, false) AS ?Prerequisite)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:hasPrerequisiteCourse ?preCourse.\
                            BIND(IF(BOUND(?preCourse), true, false) AS ?PrerequisiteCourse)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:requiresSoftware ?soft.\
                            BIND(IF(BOUND(?soft), true, false) AS ?Softwares)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:isPartOfProgramme ?pro.\
                            BIND(IF(BOUND(?pro), true, false) AS ?Programs)\
                        }\
                        \
                        OPTIONAL {\
                            ?course gch:hasSubject ?sub.\
                            BIND(IF(BOUND(?sub), true, false) AS ?Concept)\
                        }\
                        }';

    queryUrl_nodes = url + "?query=" + encodeURIComponent(query_nodes) + "&format=json";

    $.ajax({
        dataType: "json",
        url: queryUrl_nodes,
        success: function (data) {
            console.log(JSON.stringify(data))
            semantic_graph(data, 'mynetwork');
        }
    });

};


function semantic_graph(jsonData, cont) {
    var sub_upper = document.getElementById('sub-upper');
    document.getElementById('sub-lower-content').innerHTML = '';
    var elements = sub_upper.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'none'; // For example, hide the element
    }

    // Execute your function with the clicked node name
    var sub_lower = document.getElementById('sub-lower');
    var elements = sub_lower.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'block'; // For example, hide the element
    }
    document.getElementById('sub-lower-content').innerHTML = '';

    // Extracting the first object from the JSON array
    var data = jsonData[0];

    // Create an array to hold nodes and edges
    var nodes = [];
    var edges = [];

    // Calculate the number of true values (nodes to be displayed)
    var trueKeys = Object.keys(data).filter(function(key) {
        return key !== 'name' && data[key] === 'true';
    });

    var numNodes = trueKeys.length;
    var radius = 200;


    // Add central node
    nodes.push({ id: 0, label: data.name, x: 0, y: 0});

    // Calculate positions for each true node
    trueKeys.forEach(function(key, index) {
        var angle = (index / numNodes) * 2 * Math.PI;
        var x = radius * Math.cos(angle);
        var y = radius * Math.sin(angle);
        if ((y >= -30 && y <=30) && (x > 0)){
            x = x + 80
            y = y + 80
        }
        if ((y >= -30 && y <=30) && (x < 0)){
            x = x - 80
            y = y + 80
        }
        // Replace underscores with spaces in the node label
        var label = key.replace(/_/g, ' ');

        // Add node for each property with value 'true'
        var nodeId = nodes.length;
        nodes.push({ id: nodeId, label: label, x: x, y: y , color: { background: '#9cdbff', border: '#000000' }});

        // Determine edge label based on the type of node
        var edgeLabel = 'has';
        if (key === 'Program') {
            edgeLabel = 'is part of';
        } else if (key === 'Software') {
            edgeLabel = 'requires';
        }

        // Add edge from central node to this node with the determined edge label
        edges.push({ from: 0, to: nodeId, label: edgeLabel });
    });

    // Create a DataSet for nodes and edges
    var nodesDataSet = new vis.DataSet(nodes);
    var edgesDataSet = new vis.DataSet(edges);

    // Create a network
    var container = document.getElementById(cont);
    var data = { nodes: nodesDataSet, edges: edgesDataSet };
    var options = {
        physics: {
            enabled: false // Disable physics to keep nodes in fixed positions
        },
        edges: {
            arrows: 'to'
        },
        interaction: {
            hover: true // Enable hover interactions
        },
    };
    var network = new vis.Network(container, data, options);

    // Get the label of the node with ID 0
    var centralNodeLabel = nodesDataSet.get(0).label;

    // Add click event listener to the network
    network.on("click", function (params) {
        // Check if the click event occurred on a node and the clicked node ID is not 0
        if (params.nodes.length > 0) {
            var clickedNodeId = params.nodes[0];
            var clickedNodeLabel = nodesDataSet.get(clickedNodeId).label;
            // Execute your function with the clicked node name
            var sub_upper = document.getElementById('sub-lower');
            var elements = sub_upper.querySelectorAll('.initial-text');
            // Loop through each selected element
            for (var i = 0; i < elements.length; i++) {
                // Apply your desired styles to each element
                elements[i].style.display = 'none'; // For example, hide the element
            }
            var concept_graph = document.getElementById('concept-graph');
            if (concept_graph !== null) {
                document.getElementById('sub-lower').removeChild(concept_graph);
            }
            // Call your function here, passing the clicked node name as a parameter
            node_description(clickedNodeLabel, centralNodeLabel);
        }
    });
}


function node_description(label,course_name){
    node_decp = {'Prerequisite comments': 'gch:hasPrerequisiteComment', 
                'Concepts': 'gch:hasSubject',
                'Learning Units': 'gch:hasLearningUnit',
                'Didactic Approach': 'gch:hasDidacticalApproachComment',
                'Software': 'gch:requiresSoftware',
                'Prerequisite courses': 'gch:hasPrerequisiteCourse',
                'Program': 'gch:isPartOfProgramme',
                'Learning outcomes': 'gch:hasLearningOutcome'
            };
    
    node_decp[course_name]= '<http://purl.org/dc/terms/abstract>';      

    var query_description = 'Prefix skos: <http://www.w3.org/2004/02/skos/core#>'+
                            '    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                            '    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                            '    prefix gch: <http://gch.utwente.nl/ontology#>'+
                            '    prefix xsd: <http://www.w3.org/2001/XMLSchema#>'+
                            '    Select distinct ?item ?item2 where {'+
                            '    ?course rdfs:label "'+course_name+'"@en;'+ 
                            '        '+node_decp[label]+' ?item2.'+
                            '    optional {  ?item2 rdfs:label ?item. }'+
                            '    }'

    queryUrl_description = url + "?query=" + encodeURIComponent(query_description) + "&format=json";


    $.ajax({
        dataType: "json",
        url: queryUrl_description,
        success: function (data) {

            var data_key

            if (data[0].item === null){
                data_key = 'item2';
            }

            else{
                data_key = 'item';
            }

            // New code
            var data_content = document.getElementById('sub-lower-content');
            data_content.innerHTML = ''; // Clear previous content

            // Create h3 element
            var title_div = document.createElement('div')
            title_div.className = 'sidebar-title'
            var h3 = document.createElement('h3');

            if(label===course_name){
                label='Course Description'
            }

            h3.textContent = label;
            h3.style.marginTop = 0;
            title_div.appendChild(h3)

            // Append h3 to data_content
            data_content.appendChild(title_div);

            // Check if data length is greater than 1
            if (data.length > 1) {
                if (label === 'Concepts') {
                    // Create ul element
                    var ul = document.createElement('ul');
                    ul.className = 'dashed';
                    ul.id = 'concept-list';

                    // Append ul to data_content
                    data_content.appendChild(ul);
                    
                    // Sorting of data
                    data.sort((a, b) => {
                        return a[data_key].localeCompare(b[data_key]);
                      });
                    for (var i = 0; i < data.length; i++) {
                        // Create li element
                        var li = document.createElement('li');
                        li.textContent = data[i][data_key];
                        li.className = 'each-concept-in-list'
                        // Add onclick event to li
                        // Append li to ul
                        ul.appendChild(li);
                        $(li).on('click', function() {
                            get_concept_info(this);
                        });
                    }
                } else {
                    // Create ul element
                    var ul = document.createElement('ul');
                    // Append ul to data_content
                    ul.className = 'dashed';
                    data_content.appendChild(ul);

                    if (label === 'Software' || label === 'Prerequisite courses'){
                        data.sort((a, b) => {
                            return a[data_key].localeCompare(b[data_key]);
                        });
                    }
                    
                    
                    for (var i = 0; i < data.length; i++) {
                        // Create li element
                        var li = document.createElement('li');
                        li.textContent = data[i][data_key];
                        // Append li to ul
                        ul.appendChild(li);
                    }
                }
            } else {
                // If data length is not greater than 1
                var p = document.createElement('p');
                p.textContent = data[0][data_key];
                // Append p to data_content
                data_content.appendChild(p);
            }
        
        }
    });

};



function get_concept_info(con) {
    var concept_graph = document.createElement('div');
    concept_graph.id = 'concept-graph';

    var top_div = document.createElement('div')
    top_div.id = 'concept-graph-close-btn'

    var close_btn = document.createElement('button');
    close_btn.id = 'close-btn';
    var close_button = document.createElement('i')
    close_button.className = 'fas fa-times';
    close_btn.appendChild(close_button);
    top_div.appendChild(close_btn);
    
    
    concept_graph.appendChild(top_div)
    $(close_btn).on('click', function() {
        document.getElementById('sub-lower').removeChild(concept_graph);
    });

    var bottom_div = document.createElement('div');
    bottom_div.id = 'concept-graph-figure'

    concept_graph.appendChild(top_div);
    concept_graph.appendChild(bottom_div);

    var data_content = document.getElementById('sub-lower');
    data_content.appendChild(concept_graph);


    // Querying the data
    var query_course =  'Prefix skos: <http://www.w3.org/2004/02/skos/core#>\
                        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
                        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
                        prefix gch: <http://gch.utwente.nl/ontology#>\
                        prefix xsd: <http://www.w3.org/2001/XMLSchema#>\
                        SELECT distinct ?concept ?close_concepts ?related_concept ?narrower_concept WHERE {\
                        ?course gch:hasSubject ?topic.\
                        ?topic rdfs:label "' + con.textContent + '"@en, ?concept.\
                        optional{  ?topic  skos:related ?close.\
                        ?close rdfs:label ?related_concept. }\
                        \
                        optional {  ?topic  skos:closeMatch ?mat.\
                        ?mat rdfs:label ?close_concepts. }\
                        \
                        optional {  ?topic skos:narrower ?narrower.\
                        ?narrower rdfs:label ?narrower_concept. }\
                        }';

    var queryUrl_course = url + "?query=" + encodeURIComponent(query_course) + "&format=json";

    $.ajax({
        dataType: "json",
        url: queryUrl_course,
        success: function (data) {
            var create_legend = false
            data.forEach(function(item) {
                // Check if all three properties are null
                if (item.close_concepts === null && item.related_concept === null && item.narrower_concept === null) {
                    var no_data_para = document.createElement('div')
                    var no_data_text = document.createElement('h3')
                    no_data_text.innerText = 'No Additional Information for this concept';
                    no_data_text.className = 'initial-text'
                    no_data_text.style.opacity = 0.8
                    no_data_para.id = 'no-data-para'
                    no_data_para.appendChild(no_data_text)
                    bottom_div.appendChild(no_data_para);
                } else {
                    create_legend = true
                    create_network_graph(data);
                }
            });
            if (create_legend){
                var legend_img = document.createElement('img')
                legend_img.src = "Assets/legend_concept.png"
                legend_img.id = 'legend-image'
                legend_img.className = 'legend-image'
                legend_img.style.display = 'block';
                concept_graph.append(legend_img);
            }

        }
    });
}


function create_network_graph(jsonData) {
    var container = document.getElementById('concept-graph-figure');
    
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
                        background: '#bff5b8'
                    }
                }
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
                    border: '#000000', // Set border color to blue
                    background: '#f5d57f', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#f5d57f'
                    },
                    hover: {
                        border: '#000000',
                        background: '#f5d57f'
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
                    border: '#000000', // Set border color to blue
                    background: '#f5cbe3', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#f5cbe3'
                    },
                    hover: {
                        border: '#000000',
                        background: '#f5cbe3'
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
                    border: '#000000', // Set border color to blue
                    background: '#d2aaf0', // Set background color to light blue
                    highlight: {
                        border: '#000000',
                        background: '#d2aaf0'
                    },
                    hover: {
                        border: '#000000',
                        background: '#d2aaf0'
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
        // layout: {
        //     hierarchical: {
        //         direction: 'UD',
        //         sortMethod: 'directed'
        //     }
        // },
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

}


function table_data(course_name){

    var query_table =   'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>'+
                        'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>'+
                        'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
                        'PREFIX gch: <http://gch.utwente.nl/ontology#>'+
                        'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'+
                        'SELECT'+
                        '?course'+
                        '?OSIRIS_number'+
                        '?Course_number'+
                        '?Credits'+
                        '?Course_duration_in_hours'+
                        '?Course_duration_in_weeks'+
                        '?Number_of_staff'+
                        '(GROUP_CONCAT(DISTINCT ?formatted_start_date; SEPARATOR=", ") AS ?Course_start_date)'+
                        '(GROUP_CONCAT(DISTINCT ?formatted_end_date; SEPARATOR=", ") AS ?Course_end_date)'+
                        '(GROUP_CONCAT(DISTINCT ?ITC_quartiles; SEPARATOR=", ") AS ?ITC_quartile)'+
                        '(GROUP_CONCAT(DISTINCT ?UT_quartiles; SEPARATOR=", ") AS ?UT_quartile)'+
                        'WHERE {'+
                        '?course rdfs:label "'+course_name+'"@en;'+
                            'gch:OSIRISNumber ?OSIRIS_number;'+
                            'gch:courseNumber ?Course_number;'+
                            'gch:credits ?Credits;'+
                            'gch:durationHours ?Course_duration_in_hours;'+
                            'gch:durationWeeks ?Course_duration_in_weeks;'+
                            'gch:numberOfStaff ?Number_of_staff.'+
                        'OPTIONAL {'+
                            '?course gch:startDate ?start_date;'+
                                    'gch:endDate ?end_date;'+
                                    'gch:quartileITC ?ITC_quartiles;'+
                                    'gch:quartileUT ?UT_quartiles.'+
                            'BIND (CONCAT('+
                                'STR(DAY(?start_date)),'+
                                '"-",'+
                                'STR(MONTH(?start_date)),'+
                                '"-",'+
                                'STR(YEAR(?start_date))) AS ?formatted_start_date)'+
                            'BIND (CONCAT('+
                                'STR(DAY(?end_date)),'+
                                '"-",'+
                                'STR(MONTH(?end_date)),'+
                                '"-",'+
                                'STR(YEAR(?end_date))) AS ?formatted_end_date)'+
                        '}'+
                        '}'+
                        'GROUP BY ?course ?OSIRIS_number ?Course_number ?Credits ?Course_duration_in_hours ?Course_duration_in_weeks ?Number_of_staff'; 
    
    var queryUrl_table = url + "?query=" + encodeURIComponent(query_table) + "&format=json";

    $.ajax({
        dataType: "json",
        url: queryUrl_table,
        success: function (data) {
            create_table(data);
        }
    });
};

function create_table(data) {

    var table = document.createElement("table");
    var headerRow = table.insertRow(0);
    
    // Create table headers, skipping the "name", "credits", "hours", and "week" columns
    for (var key in data[0]) {
        if (key !== "concept" && key !== "course"){
            var headerCell = document.createElement("th");
            headerCell.textContent = key.replaceAll('_', ' ');
            headerRow.appendChild(headerCell);
        }
    }
    
    // Populate table rows, skipping the "name", "credits", "hours", and "week" columns
    for (var i = 0; i < data.length; i++) {
        var row = table.insertRow(i + 1);
        for (var key in data[i]) {
            if (key !== "concept" && key !== "course"){

                var cell = row.insertCell();
                cell.textContent = data[i][key];
            }
        }
    }

    var container = document.getElementById("table-data");
    container.innerHTML = '';
    container.appendChild(table)
    
}


