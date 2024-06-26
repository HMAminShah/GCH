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
        serach_list.sort()
        serach_list.unshift("Select a course")
        $("#topic-name").select2({
            data: serach_list
          });
        
        $("#topic-name2").select2({
            data: serach_list,
          });

        document.getElementById('topic-name').value = '';
    }
});

function data_for_graph(course_name, containerName){
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
            semantic_graph(data, containerName);
        }
    });
};


function semantic_graph(jsonData, containerName) {
    if (containerName == 'sub-upper'){
                el_Id = 'lower-left'
            }
            else{
                el_Id = 'lower-right'
            }
    var sub_upper = document.getElementById(containerName)
    var elements = sub_upper.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'none'; // For example, hide the element
    }

    // Execute your function with the clicked node name
    var lower_left = document.getElementById(el_Id)
    var children = lower_left.children;

    // Iterate through each child element
    for (var i = 0; i < children.length; i++) {
        var child = children[i];

        // Check if the style.display property is not equal to "none"
        if (child.style.display !== "none") {
            // Clear the style by setting it to "none"
            child.style.display = "none";
        }
    }
    var elements = lower_left.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'block'; // For example, hide the element
    }

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
    var container = document.getElementById(containerName);
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

    options.interaction.hover = true;
options.interaction.hoverConnectedEdges = false;
options.interaction.navigationButtons = false;
options.interaction.zoomView = false;
options.interaction.selectConnectedEdges = false;

    var network = new vis.Network(container, data, options);

    // Get the label of the node with ID 0
    var centralNodeLabel = nodesDataSet.get(0).label;

    // Add click event listener to the network
    network.on("click", function (params) {
        //         // Check if the click event occurred on a node and the clicked node ID is not 0
                if (params.nodes.length > 0 ) {
                    var clickedNodeId = params.nodes[0];
                    var clickedNodeLabel = nodesDataSet.get(clickedNodeId).label;
                    // Execute your function with the clicked node name
                    
                    // Call your function here, passing the clicked node name as a parameter
                    node_description(clickedNodeLabel, centralNodeLabel, containerName)
                    // yourFunction(clickedNodeLabel);
                }
            });
}

function node_description(label,course_name, containerName){
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
  

            var el_Id;
            if (containerName == 'sub-upper'){
                el_Id = 'lower-left'
            }
            else{
                el_Id = 'lower-right'
            }

            var data_content = document.getElementById(el_Id);
            var children = data_content.children;
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                
                // Check if the child element does not have the specified class
                if (!child.classList.contains('initial-text')) {
                    // Remove the child
                    child.parentNode.removeChild(child);
                }
            }

            // Iterate through each child element
            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                // Check if the style.display property is not equal to "none"
                if (child.style.display !== "none") {
                    // Clear the style by setting it to "none"
                    child.style.display = "none";
                }
            }
            
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
                p.style.textAlign = 'justify';
                // Append p to data_content
                data_content.appendChild(p);
            }

        }
    });

};

function populateFirstCourse(course_name){
    var dropdown = document.getElementById("topic-name");
    var optionToRemove = "Select a course";

    var options = dropdown.options;

    // Iterate through the options to find the one with the specified text
    for (var i = 0; i < options.length; i++) {
        if (options[i].text === optionToRemove) {
            // Remove the option if found
            dropdown.remove(i);
            break; // Stop the loop once the option is removed
        }
    }

    var lower_left = document.getElementById('lower-left')
    var elements = lower_left.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'none'; // For example, hide the element
    }
    data_for_graph(course_name.value, 'sub-upper')
}


function populateSecondCourse(course_name){
    var dropdown = document.getElementById("topic-name2");
    var optionToRemove = "Select a course";

    var options = dropdown.options;

    // Iterate through the options to find the one with the specified text
    for (var i = 0; i < options.length; i++) {
        if (options[i].text === optionToRemove) {
            // Remove the option if found
            dropdown.remove(i);
            break; // Stop the loop once the option is removed
        }
    }

    var lower_right = document.getElementById('lower-right')
    var elements = lower_right.querySelectorAll('.initial-text');
    // Loop through each selected element
    for (var i = 0; i < elements.length; i++) {
        // Apply your desired styles to each element
        elements[i].style.display = 'none'; // For example, hide the element
    }
    data_for_graph(course_name.value, 'sub-lower')
}

function highlightCommonItems(list1Selector, list2Selector) {
    // Get the two specific lists
    var list1 = document.querySelector(list1Selector);
    var list2 = document.querySelector(list2Selector);

    // Get all items within the lists
    var list1Items = Array.from(list1.querySelectorAll('li'));
    var list2Items = Array.from(list2.querySelectorAll('li'));

    // Iterate through each item in list 1
    list1Items.forEach(function(item1) {
        // Get the text content of the item
        var textContent1 = item1.textContent.trim();

        // Iterate through each item in list 2
        list2Items.forEach(function(item2) {
            // Get the text content of the item
            var textContent2 = item2.textContent.trim();

            // If the text content of the two items matches
            if (textContent1 === textContent2) {
                // Make the text bold
                item1.style.fontWeight = 'bold';
                item2.style.fontWeight = 'bold';
            }
        });
    });
}

function removeHighlight(listSelector){
    var list1 = document.querySelector(listSelector);

    // Get all items within the lists
    var list1Items = Array.from(list1.querySelectorAll('li'));

    // Iterate through each item in list 1
    list1Items.forEach(function(item1) {
        
        // If the text content of the two items matches
        item1.style.fontWeight = 'normal';   
    });
}

var list1Generated = false;
var list2Generated = false;


// Create a MutationObserver to monitor changes in the DOM
var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        // Check if any of the lists are removed from the DOM
        if (!document.contains(document.querySelector('#lower-left ul'))) {
            list1Generated = false;
            if (list2Generated === true){
                removeHighlight('#lower-right ul');
            }
        }
        if (!document.contains(document.querySelector('#lower-right ul'))) {
            list2Generated = false;
            if (list1Generated === true){
                removeHighlight('#lower-left ul');
            }
        }
        // Check if any of the lists are added to the DOM
        if (document.contains(document.querySelector('#lower-left ul'))) {
            list1Generated = true;
            if (list2Generated === true){
                removeHighlight('#lower-right ul');
                highlightCommonItems('#lower-left ul', '#lower-right ul');
            }
            
        }
        if (document.contains(document.querySelector('#lower-right ul'))) {
            list2Generated = true;
            if (list1Generated === true){
                removeHighlight('#lower-left ul');
                highlightCommonItems('#lower-right ul', '#lower-left ul');
            }
            
        }
    });
});

// Configure and start the MutationObserver
var observerConfig = { childList: true, subtree: true };
observer.observe(document.body, observerConfig);