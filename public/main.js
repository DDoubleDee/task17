const screencontainer = document.querySelector("screen-container"),
    inputs = document.querySelectorAll("form input"),
    host = "http://task17/api",
    projects = document.querySelector("screen-projects ul"),
    projectname = document.querySelector("#project"),
    aside = document.querySelector("aside"),
    pcont = document.querySelector("project-container"),
    pname = document.querySelector("header input"),
    err = document.querySelector("#error"),
    background = document.querySelector("#background"),
    nav = document.querySelector("nav")

let active = false,
    screen = window.localStorage.getItem("screen"),
    token = window.localStorage.getItem("token"),
    axiosi,
    xstart,
    ystart,
    xmstart,
    ymstart,
    xhistory,
    yhistory,
    zoom = 1,
    elem,
    chosen,
    zoomed = false,
    transformwas

if (token) {
    createInstance()
}

function loadProjects() {
    axiosi.get("/projects")
        .then((data) => {
            let l = projects.children.length
            for (let i = l - 2; i > 0; i--) {
                projects.children[i].remove()
            }
            data.data.data.forEach(element => {
                let li = document.createElement("li")
                li.setAttribute("pid", element.id)
                li.innerText = element.name
                li.addEventListener("click", load)
                projects.insertBefore(li, projects.children[projects.children.length - 1])
            });
        })
}
function loadProject(id) {
    if (active) { return }
    active = true
    axiosi.get("/projects/" + id)
        .then((data) => {
            window.localStorage.setItem("pid", id.toString())
            window.localStorage.setItem("pname", data.data.data.name)
            pcont.innerHTML = (data.data.data.content || { html: "" }).html || ""
            projectname.value = data.data.data.name
            axiosi.get("/elements")
                .then((data) => {
                    aside.innerHTML = ""
                    data.data.data.forEach(element => {
                        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                        svg.innerHTML = element.svg
                        svg.setAttribute("width", element.width)
                        svg.setAttribute("height", element.height)
                        svg.setAttribute("is_basis", !!element.is_basis)
                        svg.setAttribute("name", element.name)
                        svg.style.cursor = "grab"
                        svg.addEventListener("mousedown", moveElement)
                        aside.append(svg)
                        calc()
                        showChosen()
                    });
                    active = false
                })
            if (screen != "2") {
                window.localStorage.setItem("screen", "2")
                screen = "2"
                $({ i: 0 }).animate({ i: 100 }, {
                    duration: 500, step: (now) => {
                        background.style.left = `-${now / 2}vh`
                        screencontainer.style.left = `-${now}vw`
                    }, complete: () => {
                        active = false
                    }
                })
            }
        })
}
function load(ev) {
    loadProject(ev.target.getAttribute("pid"))
}
function goBack() {
    if (active) { return }
    active = true
    loadProjects()
    window.localStorage.setItem("screen", "1")
    screen = "1"
    $({ i: 100 }).animate({ i: 0 }, {
        duration: 500, step: (now) => {
            background.style.left = `-${now / 2}vh`
            screencontainer.style.left = `-${now}vw`
        }, complete: () => {
            active = false
        }
    })
}
function newProject() {
    if (active) { return }
    active = true
    axiosi.post("/projects")
        .then((data) => {
            active = false
            loadProject(data.data.data[0].id)
        })
}
function signIn() {
    if (active) { return }
    active = true
    axios.post(host + "/login", { login: inputs[0].value, pid: inputs[1].value })
        .then((data) => {
            token = data.data.data.token
            window.localStorage.setItem("token", token)
            createInstance()
            loadProjects()
            $({ i: 0 }).animate({ i: 100 }, {
                duration: 500, step: (now) => {
                    background.style.top = `-${now / 2}vh`
                    screencontainer.style.top = `-${now}vh`
                }, complete: () => {
                    active = false
                    window.localStorage.setItem("screen", "1")
                    screen = "1"
                }
            })
        })
        .catch(() => {
            err.style.display = "block"
            err.innerText = "Incorrect pin"
            setTimeout(() => {
                err.style.display = "none"
            }, 3000)
            active = false
        })
}
function signOut() {
    if (active) { return }
    active = true
    window.localStorage.setItem("screen", "0")
    screen = "0"
    window.localStorage.removeItem("token")
    $({ i: 100 }).animate({ i: 0 }, {
        duration: 500, step: (now) => {
            background.style.top = `-${now / 2}vh`
            screencontainer.style.top = `-${now}vh`
        }, complete: () => {
            active = false
        }
    })
}
function createInstance() {
    axiosi = axios.create({
        baseURL: host,
        timeout: 5000,
        headers: { "Authorization": "Bearer " + token }
    })
}
function moveContainer(ev) {
    ev.preventDefault();
    if (active) { return }
    if (ev.target == pcont || ev.target == pcont.parentElement) {
        xstart = parseInt(pcont.style.left) || 0
        ystart = parseInt(pcont.style.top) || 0
        xmstart = ev.clientX
        ymstart = ev.clientY
        window.addEventListener("mousemove", trackContainer)
    }
    try {
        if (zoomed) return
        let t = ev.target
        while (!t.hasAttribute("is_basis")) { t = t.parentElement }
        elem = t
        for (const element of pcont.children) {
            element.classList.remove("chosen")
        }
        chosen = elem
        chosen.classList.add("chosen")
        showChosen()
        elem.style.cursor = "grabbing"
        elem.style.zIndex = "9"
        xstart = elem.getBoundingClientRect().left
        ystart = elem.getBoundingClientRect().top
        xhistory = elem.style.left
        yhistory = elem.style.top
        xmstart = ev.clientX
        ymstart = ev.clientY
        elem.style.left = `${xstart + ev.clientX - xmstart}px`
        elem.style.top = `${ystart + ev.clientY - ymstart}px`
        elem.style.position = "fixed"
        window.addEventListener("mousemove", trackElement)
    } catch (error) {

    }
}
function stopContainer(ev) {
    window.removeEventListener("mousemove", trackContainer)
}
function trackContainer(ev) {
    ev.preventDefault();
    pcont.style.left = `${xstart + ev.clientX - xmstart}px`
    pcont.style.top = `${ystart + ev.clientY - ymstart}px`
}
function zoomContainer(ev) {
    if (ev.deltaY < 0 && zoom < 2) {
        zoom += 0.1
        zoomed = true
        projectname.nextElementSibling.style.display = "block"
        pcont.parentElement.style.boxShadow = "inset red 0px 0px 5px 5px"
        pcont.style.transform = `scale(${zoom})`
    } else if (zoom > 0.2) {
        zoom -= 0.1
        zoomed = true
        projectname.nextElementSibling.style.display = "block"
        pcont.parentElement.style.boxShadow = "inset red 0px 0px 5px 5px"
        pcont.style.transform = `scale(${zoom})`
    }
    if (zoom == 1) {
        zoomed = false
        projectname.nextElementSibling.style.display = "none"
        pcont.parentElement.style.boxShadow = null
        pcont.style.transform = null
    }
}
function resetZoom() {
    zoom = 1
    zoomed = false
    projectname.nextElementSibling.style.display = "none"
    pcont.parentElement.style.boxShadow = null
    pcont.style.transform = null
}
function moveElement(ev) {
    ev.preventDefault();
    if (zoomed) return
    let t = ev.target
    while (!t.hasAttribute("is_basis")) { t = t.parentElement }
    elem = t.cloneNode(true)
    for (const element of pcont.children) {
        element.classList.remove("chosen")
    }
    chosen = elem
    chosen.classList.add("chosen")
    elem.style.marginTop = "0";
    t.parentElement.append(elem)
    elem.style.cursor = "grabbing"
    elem.style.position = "fixed"
    xstart = t.getBoundingClientRect().left
    ystart = t.getBoundingClientRect().top
    xmstart = ev.clientX
    ymstart = ev.clientY
    elem.style.zIndex = "9"
    elem.style.left = `${xstart + ev.clientX - xmstart}px`
    elem.style.top = `${ystart + ev.clientY - ymstart}px`
    showChosen()
    window.addEventListener("mousemove", trackElement)
}
function trackElement(ev) {
    ev.preventDefault();
    calc()
    elem.style.left = xstart + ev.clientX - xmstart
    elem.style.top = ystart + ev.clientY - ymstart
}
function stopElement(ev) {
    if (elem) {
        window.removeEventListener("mousemove", trackElement)
        elem.style.cursor = "grab"
        let bound = pcont.parentElement.getBoundingClientRect(),
            boundcont = pcont.getBoundingClientRect(),
            belong = elem.parentElement == pcont
        pcont.append(elem)
        elem.style.left = (parseInt(elem.style.left) - boundcont.left)
        elem.style.top = (parseInt(elem.style.top) - boundcont.top)
        elem.style.position = "absolute"
        if (elem.getAttribute("is_basis") == "true") {
            elem.style.zIndex = "7"
        } else {
            elem.style.zIndex = "10"
        }
        if (elem.getAttribute("is_basis") == "true") {
            for (const element of pcont.children) {
                if (element.getAttribute("is_basis") == "true") {
                    let bound = element.getBoundingClientRect(),
                        belem = elem.getBoundingClientRect(),
                        ib = belem.top + belem.height > bound.top && belem.top + belem.height < bound.top + bound.height,
                        it = belem.top > bound.top && belem.top < bound.top + bound.height,
                        il = belem.left > bound.left && belem.left < bound.left + bound.width,
                        ir = belem.left + belem.width > bound.left && belem.left + belem.width < bound.left + bound.width
                    if ((it || ib) && (il || ir)) {
                        if (belong) {
                            elem.style.left = xhistory
                            elem.style.top = yhistory
                        } else {
                            elem.remove()
                        }
                    }
                }
            }
        } else {
            for (const element of pcont.children) {
                if (element.getAttribute("is_basis") == "false") {
                    let bound = element.getBoundingClientRect(),
                        belem = elem.getBoundingClientRect(),
                        ib = belem.top + belem.height > bound.top && belem.top + belem.height < bound.top + bound.height,
                        it = belem.top > bound.top && belem.top < bound.top + bound.height,
                        il = belem.left > bound.left && belem.left < bound.left + bound.width,
                        ir = belem.left + belem.width > bound.left && belem.left + belem.width < bound.left + bound.width
                    if ((it || ib) && (il || ir)) {
                        if (belong) {
                            elem.style.left = xhistory
                            elem.style.top = yhistory
                        } else {
                            elem.remove()
                        }
                    }
                }
            }
        }
        elem = null
        calc()
        updateList()
        save()
    }
}
function updateName() {
    if(screen == "2" || screen == 2){
        axiosi.patch("/projects/" + window.localStorage.getItem("pid"), { name: pname.value })
            .then((data) => {
            })
    }
}
function calc() {
    let top = 10000, left = 10000, right = -1000, bottom = -1000
    for (const element of pcont.children) {
        let rect = element.getBoundingClientRect()
        if (rect.top < top) top = rect.top
        if (rect.left < left) left = rect.left
        if (rect.top + rect.height > bottom) bottom = rect.top + rect.height
        if (rect.left + rect.width > right) right = rect.left + rect.width
    }
    document.querySelector("footer").innerText = `Area of workspace: ${Math.round(((right - left) * (bottom - top) / 10000) * 100) / 100}m`
}
function stopChosen(ev) {
    if (ev.code == "Escape") {
        for (const element of pcont.children) {
            element.classList.remove("chosen")
        }
        save()
        showChosen()
    } else if (ev.code == "Delete") {
        document.querySelector(".chosen").remove()
        save()
        calc()
        showChosen()
    } else if(ev.code == "KeyR") {
        chosen = document.querySelector(".chosen")
        if(chosen.style.transform.includes("rotate")){
            let rotation = parseInt(chosen.style.transform.replace('rotate(', '')) + 90
            chosen.style.transform = `rotate(${rotation == 360 ? 0 : rotation}deg)`
        }else{
            chosen.style.transform = 'rotate(90deg)'
        }
        save()
        calc()
        showChosen()
    }
}
function save() {
    axiosi.patch("/projects/" + window.localStorage.getItem("pid"), { content: { html: pcont.innerHTML } })
        .then((data) => {
        })
}
function showChosen() {
    chosen = document.querySelector(".chosen")
    if (chosen) {
        nav.children[0].innerHTML = `Name: ${chosen.getAttribute("name")} <br> Width: ${chosen.getAttribute("width")} <br> Height: ${chosen.getAttribute("height")} <br> Is basis: ${chosen.getAttribute("is_basis")} <br> Rotation: ${parseInt(chosen.style.transform.replace('rotate(', '')) || 0} degrees`
    } else {
        nav.children[0].innerHTML = ""
    }
    updateList()
}
function updateList() {
    nav.children[1].innerHTML = ""
    for (let i = 0; i < pcont.children.length; i++) {
        let p = document.createElement("p")
        p.setAttribute("pid", i.toString())
        p.innerText = pcont.children[i].getAttribute("name")
        p.addEventListener("click", (ev) => {
            for (const element of pcont.children) {
                element.classList.remove("chosen")
            }
            pcont.children[parseInt(ev.target.getAttribute("pid"))].classList.add("chosen")
            showChosen()
            save()
        })
        nav.children[1].append(p)
    }
}


switch (screen) {
    case "0":
        screencontainer.style.top = `0vh`
        screencontainer.style.left = `0vw`
        background.style.top = `0vh`
        background.style.left = `0vw`
        break

    case "1":
        loadProjects()
        screencontainer.style.top = `-100vh`
        screencontainer.style.left = `0vw`
        background.style.top = `-50vh`
        background.style.left = `0vw`
        break

    case "2":
        loadProject(window.localStorage.getItem("pid"))
        screencontainer.style.left = `-100vw`
        screencontainer.style.top = `-100vh`
        background.style.top = `-50vh`
        background.style.left = `-50vw`
        break

    default:
        screencontainer.style.top = `0vh`
        background.style.top = `0vh`
        window.localStorage.setItem("screen", "0")
        screen = "0"
        break
}