<?php

include 'error_handler.php';


if(empty($_POST['action']) || empty($_POST['data'])){
    return_error('A POST parameter is not set', '1001');
}

$action = $_POST['action'];
$data = $_POST['data'];
$response = '';


switch ($action) {
    case 'bookmark_added':
    $response = insert_bookmark($data);
        if($response == 'Success')
            $response = get_recommendations_for_bookmarked_document($data);
        break;        
    case 'bookmark_deleted':
        $response = delete_bookmark($data); break;
    case 'keywords_changed':
        $response = get_recommendations_for_keywords($data); break;
    case 'initial_data_added':
        $response = insert_bookmark($data); break;
    default: 
        return_error('Unknown action', '1002'); break;
}

echo $response;



function insert_bookmark($parameters) {

    $expected_parameters = array('user_id', 'document_id', 'document_title', 'query', 'keywords');    
    validate_all_parameters_set($parameters, $expected_parameters);  // if false returns echoes error message back
    $qk_string = get_qk_string($parameters['query'], $parameters['keywords']);
    
    $mysqli = get_mysqli();
    set_sp_parameter($mysqli, '@user_id', $parameters['user_id']);
    set_sp_parameter($mysqli, '@document_id', $parameters['document_id']);
    set_sp_parameter($mysqli, '@document_title', convert_smart_quotes($parameters['document_title']));
    set_sp_parameter($mysqli, '@qk_string', $qk_string);
    $result = call_sp($mysqli, 'insert_data', '@user_id, @document_id, @document_title, @qk_string');
    $row = $result->fetch_assoc();
    $mysqli->close();
    return $row['message'];
}



function delete_bookmark($parameters) {

    $expected_parameters = array('user_id', 'document_id', 'query', 'keywords');    
    validate_all_parameters_set($parameters, $expected_parameters);  // if false returns echoes error message back
    $qk_string = get_qk_string($parameters['query'], $parameters['keywords']);

    $mysqli = get_mysqli();
    set_sp_parameter($mysqli, '@user_id', $parameters['user_id']);
    set_sp_parameter($mysqli, '@document_id', $parameters['document_id']);
    set_sp_parameter($mysqli, '@qk_string', $qk_string);
    $result = call_sp($mysqli, 'delete_link', '@user_id, @document_id, @qk_string');
    $row = $result->fetch_assoc();
    $mysqli->close();
    return $row['message'];
}



function get_recommendations_for_bookmarked_document($parameters) {
    
    
    
}


function get_recommendations_for_keywords($parameters) {

    $user_id = $parameters['user_id'];
    $document_id = $parameters['document_id'];
    $query = $parameters['query'];
    $keywords = $parameters['keywords'];


    if(!isset($user_id) || !isset($document_id) || !isset($document_title) || !isset($query) || !isset($keywords)) {
        return_error('A parameter in data is not set', '1003');
    }

    if(!is_array($keywords)) {
        return_error('Keywords parameter is not an array', '1004');
    }

    sort($keywords);
    $qk_string = $query;
    foreach($keywords as $keyword)
        $qk_string = $qk_string.'&'.$keyword;
    $mysqli = get_mysqli();
    $result = $mysqli->query("CALL insert_data($user_id, $document_id, $document_title, $qk_string)");

    while($row = $result->fetch_assoc()) {
        $obj = new stdClass();
        $obj->id = $row['id'];
        $obj->title = $row['title'];
        $res[] = $obj;
    }
  
    $mysqli->close();
    return json_encode($res);
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function validate_all_parameters_set($parameters, $expected_parameters) {

    foreach($expected_parameters as $p_key) {
        if(!isset($parameters[$p_key]))
            return_error("Parameter '".$p_key."' is not set");   
    }
}
    

function get_qk_string($query, $keywords) {
    if(!is_array($keywords)) {
        return_error('Keywords parameter is not an array', '1004');
    }

    sort($keywords);
    $qk_string = $query;
    foreach($keywords as $keyword)
        $qk_string = $qk_string.'&'.$keyword;
    
    return $qk_string;
}


function convert_smart_quotes($string) 
{ 
    $search = array(chr(145), 
                    chr(146), 
                    chr(147), 
                    chr(148), 
                    chr(151)); 

    $replace = array("'", 
                     "'", 
                     '"', 
                     '"', 
                     '-'); 

    return str_replace($search, $replace, $string); 
}


function get_mysqli() {
    // connect to db
    $mysqli = new mysqli("localhost", "urank", "urank", "urank-schema");

    // Check connection
    if ($mysqli->connect_error) {
        die('Connect Error (' . $mysqli->connect_errno . ') '. $mysqli->connect_error);
    }
    return $mysqli;
}


function set_sp_parameter($mysqli, $p_name, $p_value) {    
  
//    $aa = str_split($p_value);
//    $s = '';
//    foreach($aa as $a) {
//        if(ord($a) == 39)
//            $a = '\'';
//        $s = $s.$a;
//    }
//    $p_value = $s;
//    echo $s;
    
    $p_value = addslashes($p_value);
    
    if (!$mysqli->query("SET ".$p_name." = '".$p_value."'")) {
    
        return_error("SET ".$p_name." = ".$p_value." failed: (" . $mysqli->errno . ") ", $mysqli->error);
        //return_error($p_value." : " .$s, $mysqli->error);
    }
}


function call_sp($mysqli, $sp_name, $parameter_string) {
    if (! $result = $mysqli->query("CALL ".$sp_name."(".$parameter_string.")")) {
        return_error("CALL ".$sp_name."() failed: (" . $mysqli->errno . ") \n ", $mysqli->error);
    }
    return $result;
}

?>
