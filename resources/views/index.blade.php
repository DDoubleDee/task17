<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="{{URL::to('/')}}/style.css">
    <title>Task 17</title>
</head>
<body onkeydown="stopChosen(event)" onmouseup="stopContainer(event); stopElement(event)">
    <screen-container>
        <screen-login>
            <form onsubmit="event.preventDefault(); signIn()">
                <form-header>Sign in</form-header>
                <label for="login">Login:</label>
                <input name="login" type="text" autocomplete="nickname" id="login">
                <label for="password">Pin:</label>
                <input name="password" type="password" autocomplete="current-password" id="password">
                <input id="submit" type="submit" value="Submit">
            </form>
        </screen-login>
        <screen-projects>
            <ul>
                <li style="color: red" onclick="signOut()">
                    Sign Out
                </li>
                <li onclick="newProject()">
                    +
                </li>
            </ul>
        </screen-projects>
        <screen-project>
            <header>
                <button onclick="goBack()">
                    Go Back
                </button>
                <input onchange="updateName()" type="text" id="project">
                <button style="display: none" onclick="resetZoom()">
                    Reset Zoom to Enable Edit
                </button>
            </header>
            <aside>

            </aside>
            <main onwheel="zoomContainer(event)" onmousedown="moveContainer(event)">
                <project-container style="width: 2000px; height: 2000px;" draggable="false">

                </project-container>
            </main>
            <nav>
                <chosen-info>

                </chosen-info>
                <item-list>
                    
                </item-list>
            </nav>
            <footer>
    
            </footer>
        </screen-project>
    </screen-container>
    <div id="background">

    </div>
    <div id="error"></div>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{URL::to('/')}}/jquery-3.6.0.min.js"></script>
    <script src="{{URL::to('/')}}/main.js"></script>
</body>
</html>