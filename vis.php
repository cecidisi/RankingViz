<?php
    $dataset = $_POST["dataset"];
?>


<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <title>TODO supply a title</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">

        <script type="text/javascript" src="libs/jquery-1.10.2.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/jquery-ui.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/d3.v3.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/natural.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/colorbrewer.js" charset="utf-8"></script>
        <link rel="stylesheet" type="text/css" href="libs/ui/jquery-ui-1.10.4.custom.min.css">

		<script type="text/javascript" src="js/rankingvis.js" charset="utf-8"></script>
        <script type="text/javascript" src="js/settings.js" charset="utf-8"></script>
        <script type="text/javascript" src="js/utils.js" charset="utf-8"></script>
        <script type="text/javascript" src="js/show-and-hide-section.js" charset="utf-8"></script>

       <!-- <link rel="stylesheet" type="text/css" href="css/vis.css" /> -->
        <link rel="stylesheet" type="text/css" href="css/general-style.css" />
        <link rel="stylesheet" type="text/css" href="css/vis-template-style-static.css" />
        <link rel="stylesheet" type="text/css" href="css/vis-template-style-alternative-3-test.css" />

        <link rel="stylesheet" type="text/css" href="css/vis-template-chart-style-cecilia.css" />
    </head>
    <body>

        <div id="dataset" style="display: none;">
            <?php
                echo htmlspecialchars($dataset);
            ?>
        </div>

        <!--
        <header id="eexcess_header">
			<div id="eexcess_inner_header">
		  		<div id="eexcess_header_search">
	    			<input id="eexcess_search_field" class="eexcess_query_field" type="text" name="query" value="" />
                    <input id="eexcess_search_button" class="eexcess_submit_btn" type="button" value="Search" />
	  			</div>
	  			<div id="eexcess_header_intro_and_task_section">
	  				<span></span>
	  			</div>
	  			<div id="eexcess_header_filter">
                    <a target="_blank" href="help-visdashboard.html" >
                        <img src="../../media/icons/help.png" />
                    </a>
	  			</div>
			</div>
      	</header>
        -->


		<header id="eexcess_header">
            <section id="eexcess_header_task_section">
	  			<span></span>
                <p></p>
                <div>
                    <img src="media/batchmaster/arrow-up.png" expanded="true" />
                    <input type="button" id="eexcess_finished_button" value="Finished" />
                </div>
	  		</section>
            <section id="eexcess_message_section">
	    	  <p></p>
	  		</section>
	  		<section id="eexcess_selected_items_section"></section>
      	</header>

		<div id="eexcess_main_panel">

            <div id="eexcess_controls_left_panel">
                <div id="eexcess_keywords_container"></div>
            </div>

            <div id="eexcess_vis_panel" >

                <div id="eexcess_vis_panel_controls">
                    <div id="eexcess_ranking_controls">
                        <button id="eexcess_btnreset">
                            <img src="media/batchmaster/refresh.png" title="Reset" />
                        </button>
                        <button id="eexcess_btn_sort_by_overall_score" title="Sort by overall score" sort-by="overall_score">
                            <img src="media//sort-down.png" />
                        </button>
                        <button id="eexcess_btn_sort_by_max_score" title="Sort by maximum score" sort-by="max_score">
                            <img src="media/sort-down.png" />
                        </button>
                    </div>

                    <div id="eexcess_keywords_box">
                        <p>Drop tags here!</p>
                    </div>
                </div>

                <div id="eexcess_vis_panel_canvas">
                    <div id="eexcess_content" >
                        <ul class="eexcess_result_list"></ul>
                    </div>

                    <div id="eexcess_canvas"></div>
                </div>

            </div>

            <div id="eexcess_document_panel">
                <div id="eexcess_document_controls"></div>
                <div id="eexcess_document_viewer"></div>
            </div>

		</div>

        <script type="text/javascript" src="js/vis-controller.js" charset="utf-8"></script>

    </body>
</html>
