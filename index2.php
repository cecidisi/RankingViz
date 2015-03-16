
<!DOCTYPE html>

<html>
    <head>
        <title>uRank</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">

        <script type="text/javascript" src="libs/jquery-1.10.2.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/natural-adapted.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/d3.v3.js" charset="utf-8"></script>

        <script type="text/javascript" src="datasets/datasetManager.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t1_30.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t1_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t2_30.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t2_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t3_30.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t3_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t4_30.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t4_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_test.js" charset="utf-8" ></script>

        <link rel="stylesheet" type="text/css" href="css/general-style.css" />
        <link rel="stylesheet" type="text/css" href="css/index-style.css" />
    </head>

    <body>

        <div id="task" style="display:none;">
            <?php
                echo htmlspecialchars($_GET["task"]);
            ?>
        </div>
        <div style="display: none;">
            <form action="vis.php" method="post">
                <input type="text" name="dataset" />
            </form>
        </div>

        <div>
            <span>Topic: </span>
            <select id="select-dataset"></select>

            <span>Tool aided: </span>
            <select id="select-tool-condition">
                <option value="yes" selected="selected">Yes</option>
                <option value="no">No</option>
            </select>
        </div>
        <div>

        </div>

        <section id="section-task">
            <h1>Task</h1>
            <p>The task consists in 3 Questions. For each one of them, select 5 items from the list that you consider the most relevant</p>
        </section>
        <section id="section-text">
            <h1>Topic Overview</h1>
            <p></p>
        </section>


        <input type="button" id="start-button" value="Start" />

        <div id="eexcess_loading" style="display: none">
            <img src="media/loading.gif" />
        </div>

        <script type="text/javascript" src="scripts/starter2.js" charset="utf-8"></script>

    </body>

</html>
