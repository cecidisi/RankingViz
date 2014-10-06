<!DOCTYPE html>

<html>
    <head>
        <title>TODO supply a title</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width">

        <script type="text/javascript" src="libs/jquery-1.10.2.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/natural.js" charset="utf-8"></script>
        <script type="text/javascript" src="libs/d3.v3.js" charset="utf-8"></script>

        <script type="text/javascript" src="scripts/utils.js" charset="utf-8"></script>

        <script type="text/javascript" src="datasets/datasetManager.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t1_30.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t1_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t2_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t3_60.js" charset="utf-8" ></script>
        <script type="text/javascript" src="datasets/dataset_t4_60.js" charset="utf-8" ></script>


        <link rel="stylesheet" type="text/css" href="css/general-style.css" />
        <link rel="stylesheet" type="text/css" href="css/index-style.css" />
    </head>

    <body>
        <div style="display: none;">
            <form action="vis.php" method="post">
                <input type="text" name="dataset" />
            </form>
        </div>

        <div>
            <span>Topic: </span>
            <select id="select-dataset"></select>
        </div>

        <section id="section-text">
            <h1>Text</h1>
            <p></p>
        </section>
        <section id="section-task">
            <h1>Task</h1>
            <p></p>
        </section>

        <div>
            <span>Tool aided: </span>
            <select id="select-tool-condition">
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
        </div>

        <input type="button" id="start-button" value="Start" />

        <script type="text/javascript" src="scripts/starter.js" charset="utf-8"></script>

    </body>

</html>
