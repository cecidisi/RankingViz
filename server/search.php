<?php
// create curl resource
$ch = curl_init();

// set url
curl_setopt($ch, CURLOPT_URL, "example.com");

//return the transfer as a string
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

// $output contains the output string
$output = curl_exec($ch);

// close curl resource to free up system resources
curl_close($ch);





///////////////////////////////////

$handler = curl_init("http://www.google.es");
$response = curl_exec ($handler);
curl_close($handler);
echo $response;




?>
